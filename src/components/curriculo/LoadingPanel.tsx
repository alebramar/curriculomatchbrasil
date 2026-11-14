import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const STEPS = [
  "Lendo a descrição da vaga...",
  "Identificando requisitos e palavras-chave...",
  "Comparando com as evidências do seu currículo...",
  "Preparando sugestões de melhoria...",
  "Montando o currículo otimizado...",
];

export function LoadingPanel() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 7000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="surface-card animate-fade-up p-8 text-center" role="status" aria-live="polite">
      <Loader2 className="mx-auto size-8 animate-spin text-success" aria-hidden="true" />
      <p className="mt-4 font-display text-lg font-semibold text-primary">{STEPS[step]}</p>
      <p className="mt-1 text-sm text-muted-foreground">A análise costuma levar até um minuto. Não feche esta página.</p>
      <div className="mx-auto mt-6 flex max-w-xs justify-center gap-1.5" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-success" : "bg-muted"}`} />
        ))}
      </div>
    </section>
  );
}
