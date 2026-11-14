import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/curriculo/BrandMark";
import { ImprovementsCard } from "@/components/curriculo/ImprovementsCard";
import { KeywordsCard } from "@/components/curriculo/KeywordsCard";
import { LoadingPanel } from "@/components/curriculo/LoadingPanel";
import { OptimizedResumeCard } from "@/components/curriculo/OptimizedResumeCard";
import { ScoreCard } from "@/components/curriculo/ScoreCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeResume } from "@/lib/analysis.functions";
import {
  MAX_CHARS,
  hasFieldErrors,
  validateInputs,
  type AnalysisResult,
  type FieldErrors,
} from "@/lib/analysis/core";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CurrículoMatch — Adapte seu currículo à vaga" },
      {
        name: "description",
        content:
          "Compare seu currículo com a descrição da vaga, veja palavras-chave encontradas e ausentes e baixe uma versão otimizada para ATS.",
      },
      { property: "og:title", content: "CurrículoMatch — Adapte seu currículo à vaga" },
      {
        property: "og:description",
        content: "Compatibilidade estimada, palavras-chave, sugestões e currículo otimizado para ATS, sem inventar informações.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Status = "idle" | "loading" | "done" | "error";

function Field({
  id,
  step,
  label,
  hint,
  placeholder,
  value,
  onChange,
  error,
  disabled,
}: {
  id: string;
  step: string;
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled: boolean;
}) {
  const over = value.length > MAX_CHARS;
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-sm font-semibold text-success">{step}</span>
        <label htmlFor={id} className="font-display text-base font-semibold text-primary">
          {label}
        </label>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-meta`}
        className="mt-3 min-h-[300px] flex-1 resize-y rounded-xl bg-background p-4 text-[15px] leading-relaxed aria-[invalid=true]:border-destructive md:min-h-[360px] md:text-[15px]"
      />
      <div id={`${id}-meta`} className="mt-2 flex items-start justify-between gap-3 text-xs">
        <span className="text-destructive">{error}</span>
        <span className={over ? "text-destructive" : "text-muted-foreground"}>
          {value.length.toLocaleString("pt-BR")} / {MAX_CHARS.toLocaleString("pt-BR")}
        </span>
      </div>
    </div>
  );
}

function Index() {
  const analyze = useServerFn(analyzeResume);
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [editedResume, setEditedResume] = useState("");
  const inFlight = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const loading = status === "loading";

  useEffect(() => {
    if (status === "done" || status === "loading" || status === "error") {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [status]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    const errors = validateInputs(jobDescription, resume);
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    inFlight.current = true;
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);
    try {
      const res = await analyze({ data: { jobDescription, resume } });
      if (res.ok) {
        setResult(res.result);
        setEditedResume(res.result.optimizedResume);
        setStatus("done");
      } else {
        setErrorMessage(res.message);
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Não foi possível concluir a análise. Verifique sua conexão e tente novamente.");
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }

  function handleReset() {
    if (inFlight.current) return;
    setJobDescription("");
    setResume("");
    setFieldErrors({});
    setResult(null);
    setEditedResume("");
    setErrorMessage(null);
    setStatus("idle");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={topRef} className="min-h-screen">
      <header className="bg-hero-gradient text-hero-foreground">
        <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6">
          <BrandMark />
          <div className="mt-12 max-w-2xl sm:mt-16">
            <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">
              Seu currículo, ajustado para a vaga certa.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-hero-muted sm:text-lg">
              Cole a vaga e o seu currículo. Mostramos a compatibilidade estimada, as palavras-chave que faltam e
              geramos uma versão otimizada para ATS — sem inventar nada sobre você.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-20 max-w-6xl space-y-6 px-4 pb-20 sm:px-6">
        <form onSubmit={handleSubmit} noValidate className="surface-card p-5 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Field
              id="job-description"
              step="01"
              label="Descrição da vaga"
              hint="Cole o anúncio completo, com requisitos e responsabilidades."
              placeholder="Ex.: Analista de Dados Pleno — Requisitos: SQL avançado, Power BI, Python..."
              value={jobDescription}
              onChange={(v) => {
                setJobDescription(v);
                if (fieldErrors.jobDescription) setFieldErrors((f) => ({ ...f, jobDescription: undefined }));
              }}
              error={fieldErrors.jobDescription}
              disabled={loading}
            />
            <Field
              id="resume"
              step="02"
              label="Seu currículo"
              hint="Cole o texto do seu currículo atual."
              placeholder="Ex.: Maria Silva — Analista de BI | maria@email.com | São Paulo/SP..."
              value={resume}
              onChange={(v) => {
                setResume(v);
                if (fieldErrors.resume) setFieldErrors((f) => ({ ...f, resume: undefined }));
              }}
              error={fieldErrors.resume}
              disabled={loading}
            />
          </div>

          <div className="mt-8 flex flex-col gap-5 border-t pt-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="flex max-w-2xl items-start gap-3 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              <span>
                Os textos são enviados ao serviço de IA apenas para processamento, sujeitos às políticas de privacidade
                e retenção desse serviço. Nada é salvo nesta aplicação. Evite incluir dados pessoais desnecessários,
                como CPF, RG e endereço residencial completo.
              </span>
            </p>
            <Button type="submit" variant="success" size="xl" disabled={loading} className="w-full shrink-0 lg:w-auto">
              <Sparkles />
              {loading ? "Analisando..." : "Analisar compatibilidade"}
            </Button>
          </div>
        </form>

        <div ref={resultsRef} className="scroll-mt-6 space-y-6">
          {loading && <LoadingPanel />}

          {status === "error" && errorMessage && (
            <section role="alert" className="surface-card animate-fade-up flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <AlertCircle className="size-6 shrink-0 text-destructive" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">A análise não foi concluída</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{errorMessage}</p>
              </div>
              <Button variant="soft" onClick={() => setStatus("idle")}>
                Fechar
              </Button>
            </section>
          )}

          {status === "done" && result && (
            <div className="animate-fade-up space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold text-primary">Resultado da análise</h2>
                <Button variant="soft" onClick={handleReset}>
                  <RotateCcw />
                  Nova análise
                </Button>
              </div>
              <ScoreCard score={result.score} summary={result.summary} />
              <KeywordsCard found={result.found} missing={result.missing} />
              <ImprovementsCard items={result.improvements} />
              <OptimizedResumeCard value={editedResume} onChange={setEditedResume} />
              <div className="flex justify-center pt-2">
                <Button variant="soft" size="lg" onClick={handleReset}>
                  <RotateCcw />
                  Iniciar nova análise
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          CurrículoMatch · Análise com Lovable AI. Os resultados são estimativas e não garantem aprovação em processos
          seletivos.
        </div>
      </footer>
    </div>
  );
}
