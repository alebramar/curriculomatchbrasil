export function ImprovementsCard({ items }: { items: { title: string; detail: string }[] }) {
  return (
    <section className="surface-card p-6 sm:p-8" aria-labelledby="improvements-title">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">C · Pontos de melhoria</p>
      <h2 id="improvements-title" className="mt-1 text-xl font-semibold text-primary">
        Sugestões práticas
      </h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nenhuma sugestão adicional para este currículo.</p>
      ) : (
        <ol className="mt-5 space-y-4">
          {items.map((item, i) => (
            <li key={i} className="flex gap-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <div>
                {item.title && <p className="font-semibold text-foreground">{item.title}</p>}
                {item.detail && <p className="mt-0.5 text-sm leading-relaxed text-foreground/75">{item.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
