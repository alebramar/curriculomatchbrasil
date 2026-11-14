import { Info } from "lucide-react";

function band(score: number) {
  if (score >= 70) return { label: "Alta compatibilidade", stroke: "stroke-success", text: "text-success" };
  if (score >= 40) return { label: "Compatibilidade moderada", stroke: "stroke-warning", text: "text-warning" };
  return { label: "Baixa compatibilidade", stroke: "stroke-gap", text: "text-gap" };
}

export function ScoreCard({ score, summary }: { score: number; summary: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const b = band(score);
  return (
    <section className="surface-card p-6 sm:p-8" aria-labelledby="score-title">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="relative size-36 shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={r} className="fill-none stroke-muted" strokeWidth="11" />
            <circle
              cx="60"
              cy="60"
              r={r}
              className={`fill-none ${b.stroke} transition-[stroke-dashoffset] duration-1000 ease-out`}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - score / 100)}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-display text-4xl font-bold text-primary" aria-label={`${score} por cento`}>
              {score}
              <span className="text-xl">%</span>
            </span>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">A · Índice estimado</p>
          <h2 id="score-title" className={`mt-1 text-2xl font-semibold ${b.text}`}>
            {b.label}
          </h2>
          {summary && <p className="mt-2 text-sm leading-relaxed text-foreground/80">{summary}</p>}
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-left text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Estimativa calculada a partir dos requisitos da vaga evidenciados no currículo (requisitos essenciais têm peso
            maior). Não é a pontuação oficial de nenhum sistema ATS nem garantia de aprovação.
          </p>
        </div>
      </div>
    </section>
  );
}
