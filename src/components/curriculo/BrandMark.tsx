export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-success text-success-foreground shadow-success">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-hero-foreground">
        Currículo<span className="text-success">Match</span>
      </span>
    </div>
  );
}
