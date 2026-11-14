import { useState } from "react";
import { AlertCircle, Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { downloadResumePdf } from "@/lib/resume-pdf";

export function OptimizedResumeCard({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (exporting) return;
    setError(null);
    if (!value.trim()) {
      setError("O currículo está vazio. Escreva ou restaure o conteúdo antes de baixar.");
      return;
    }
    setExporting(true);
    try {
      await downloadResumePdf(value);
    } catch (e) {
      console.error(e);
      setError("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="surface-card p-6 sm:p-8" aria-labelledby="resume-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">D · Currículo otimizado</p>
          <h2 id="resume-title" className="mt-1 text-xl font-semibold text-primary">
            Versão revisada para ATS
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Revise e edite à vontade antes de baixar. Confira se todas as informações estão corretas.
          </p>
        </div>
        <Button variant="success" size="xl" onClick={handleDownload} disabled={exporting} className="w-full sm:w-auto">
          {exporting ? <Loader2 className="animate-spin" /> : <Download />}
          {exporting ? "Gerando PDF..." : "Baixar currículo em PDF"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      <label htmlFor="optimized-resume" className="sr-only">
        Currículo otimizado (editável)
      </label>
      <Textarea
        id="optimized-resume"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck
        className="mt-5 min-h-[560px] resize-y rounded-xl border-input bg-background p-5 text-[15px] leading-relaxed md:text-[15px]"
      />
    </section>
  );
}
