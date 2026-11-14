import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, Output, jsonSchema, streamText } from "ai";
import type { JSONSchema7 } from "ai";

import { createLovableAiGatewayRunIdFetch } from "@/lib/ai/run-id.server";
import { normalizeAnalysis, type AnalysisResponse, type RawAnalysis } from "./core";
import { ANALYSIS_INSTRUCTIONS, ANALYSIS_SCHEMA, buildAnalysisPrompt } from "./prompt.server";

const GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const GENERIC_FAILURE =
  "Não foi possível concluir a análise agora. Tente novamente em alguns instantes.";

function messageForError(error: unknown): string {
  if (error instanceof Error && error.name === "AbortError") return "A análise foi interrompida.";
  const apiError = APICallError.isInstance(error)
    ? error
    : APICallError.isInstance((error as { cause?: unknown })?.cause)
      ? ((error as { cause: APICallError }).cause)
      : null;
  const status = apiError?.statusCode;
  if (status === 429)
    return "O serviço de análise está com muitas solicitações. Aguarde alguns instantes e tente novamente.";
  if (status === 402 || status === 403)
    return "O serviço de análise está temporariamente indisponível. Tente novamente mais tarde.";
  if (status === 400)
    return "Não foi possível processar os textos enviados. Revise o conteúdo e tente novamente.";
  if (status && status >= 500) return GENERIC_FAILURE;
  return GENERIC_FAILURE;
}

export async function runResumeAnalysis(
  input: { jobDescription: string; resume: string },
  abortSignal?: AbortSignal,
): Promise<AnalysisResponse> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    console.error("[analysis] LOVABLE_API_KEY is not configured");
    return { ok: false, message: "O serviço de análise não está configurado." };
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  let streamError: unknown;
  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions: ANALYSIS_INSTRUCTIONS,
      messages: [{ role: "user", content: buildAnalysisPrompt(input.jobDescription, input.resume) }],
      output: Output.object({
        schema: jsonSchema<RawAnalysis>(ANALYSIS_SCHEMA as unknown as JSONSchema7),
        name: "analise_curriculo",
      }),
      abortSignal,
      onError: ({ error }) => {
        streamError = error;
      },
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const raw = (await result.output) as RawAnalysis | null;
    if (raw?.inputIssue && raw.inputIssue.trim()) {
      return { ok: false, message: raw.inputIssue.trim() };
    }
    const normalized = normalizeAnalysis(raw);
    if (!normalized) {
      console.error("[analysis] unusable model output", { runId: runIdFetch.getRunId() });
      return {
        ok: false,
        message:
          "A IA não conseguiu gerar uma análise válida para esses textos. Revise o conteúdo e tente novamente.",
      };
    }
    return { ok: true, result: normalized };
  } catch (error) {
    const cause = streamError ?? error;
    console.error("[analysis] failed", { runId: runIdFetch.getRunId(), error: cause });
    return { ok: false, message: messageForError(cause) };
  }
}
