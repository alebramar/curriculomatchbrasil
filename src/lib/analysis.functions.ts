import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { hasFieldErrors, validateInputs, type AnalysisResponse } from "@/lib/analysis/core";
import { runResumeAnalysis } from "@/lib/analysis/analyze.server";

export const analyzeResume = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = (input ?? {}) as { jobDescription?: unknown; resume?: unknown };
    if (typeof data.jobDescription !== "string" || typeof data.resume !== "string") {
      throw new Error("Dados inválidos.");
    }
    if (hasFieldErrors(validateInputs(data.jobDescription, data.resume))) {
      throw new Error("Preencha a descrição da vaga e o currículo corretamente.");
    }
    return { jobDescription: data.jobDescription, resume: data.resume };
  })
  .handler(async ({ data }): Promise<AnalysisResponse> => {
    let signal: AbortSignal | undefined;
    try {
      signal = getRequest()?.signal;
    } catch {
      signal = undefined;
    }
    return runResumeAnalysis(data, signal);
  });
