import { CheckCircle2, CircleDashed } from "lucide-react";

import type { FoundKeyword, MissingKeyword } from "@/lib/analysis/core";

function ImportanceTag({ importance }: { importance: "essencial" | "desejavel" }) {
  return (
    <span className="rounded-full bg-card/70 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {importance === "essencial" ? "Essencial" : "Desejável"}
    </span>
  );
}

export function KeywordsCard({ found, missing }: { found: FoundKeyword[]; missing: MissingKeyword[] }) {
  return (
    <section className="surface-card p-6 sm:p-8" aria-labelledby="keywords-title">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">B · Palavras-chave</p>
      <h2 id="keywords-title" className="mt-1 text-xl font-semibold text-primary">
        Requisitos da vaga x seu currículo
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Equivalências de significado também são reconhecidas, não apenas palavras idênticas.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Encontradas no currículo ({found.length})
          </h3>
          {found.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nenhum requisito da vaga foi evidenciado no currículo.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {found.map((k) => (
                <li key={k.term} className="rounded-lg bg-success-soft px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-accent-foreground">{k.term}</span>
                    <ImportanceTag importance={k.importance} />
                  </div>
                  {k.evidence && (
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">“{k.evidence}”</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gap">
            <CircleDashed className="size-4" aria-hidden="true" />
            Ausentes no currículo ({missing.length})
          </h3>
          {missing.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma lacuna identificada.</p>
          ) : (
            <>
              <ul className="mt-3 flex flex-wrap gap-2">
                {missing.map((k) => (
                  <li key={k.term} className="flex items-center gap-2 rounded-lg bg-gap-soft px-3 py-2">
                    <span className="text-sm font-semibold text-gap">{k.term}</span>
                    <ImportanceTag importance={k.importance} />
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Estas lacunas não foram adicionadas ao currículo otimizado. Inclua-as somente se você realmente tiver
                essa experiência ou competência.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
