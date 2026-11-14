// Client-safe analysis types, limits, validation and scoring.

export const MIN_CHARS = 80;
export const MAX_CHARS = 15000;

export type Importance = "essencial" | "desejavel";

export interface RawRequirement {
  term: string;
  importance: Importance;
  found: boolean;
  evidence: string | null;
}

export interface RawAnalysis {
  inputIssue: string | null;
  summary: string;
  requirements: RawRequirement[];
  improvements: { title: string; detail: string }[];
  optimizedResume: string;
}

export interface FoundKeyword {
  term: string;
  importance: Importance;
  evidence: string | null;
}

export interface MissingKeyword {
  term: string;
  importance: Importance;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  found: FoundKeyword[];
  missing: MissingKeyword[];
  improvements: { title: string; detail: string }[];
  optimizedResume: string;
}

export type AnalysisResponse =
  | { ok: true; result: AnalysisResult }
  | { ok: false; message: string };

export interface FieldErrors {
  jobDescription?: string;
  resume?: string;
}

function validateField(value: string, emptyMsg: string, shortMsg: string): string | undefined {
  const len = value.trim().length;
  if (len === 0) return emptyMsg;
  if (len < MIN_CHARS) return shortMsg;
  if (len > MAX_CHARS)
    return `O texto ultrapassa o limite de ${MAX_CHARS.toLocaleString("pt-BR")} caracteres.`;
  return undefined;
}

export function validateInputs(jobDescription: string, resume: string): FieldErrors {
  const errors: FieldErrors = {};
  const job = validateField(
    jobDescription,
    "Cole a descrição da vaga.",
    `A descrição da vaga está muito curta. Inclua ao menos ${MIN_CHARS} caracteres.`,
  );
  const cv = validateField(
    resume,
    "Cole o seu currículo.",
    `O currículo está muito curto. Inclua ao menos ${MIN_CHARS} caracteres.`,
  );
  if (job) errors.jobDescription = job;
  if (cv) errors.resume = cv;
  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Boolean(errors.jobDescription || errors.resume);
}

/** Essential requirements weigh twice as much as desirable ones. */
export const IMPORTANCE_WEIGHT: Record<Importance, number> = { essencial: 2, desejavel: 1 };

/** Weighted share (0–100) of the job's requirements evidenced in the resume. */
export function computeCompatibilityScore(
  requirements: Pick<RawRequirement, "importance" | "found">[],
): number {
  let total = 0;
  let matched = 0;
  for (const req of requirements) {
    const w = IMPORTANCE_WEIGHT[req.importance] ?? 1;
    total += w;
    if (req.found) matched += w;
  }
  if (total === 0) return 0;
  return Math.max(0, Math.min(100, Math.round((matched / total) * 100)));
}

const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Turns the AI output into the app result; returns null when the output is unusable. */
export function normalizeAnalysis(raw: RawAnalysis | null | undefined): AnalysisResult | null {
  if (!raw || !Array.isArray(raw.requirements)) return null;

  const seen = new Set<string>();
  const requirements: RawRequirement[] = [];
  for (const r of raw.requirements) {
    const term = clean(r?.term);
    if (!term) continue;
    const key = term.toLocaleLowerCase("pt-BR");
    if (seen.has(key)) continue;
    seen.add(key);
    requirements.push({
      term,
      importance: r.importance === "essencial" ? "essencial" : "desejavel",
      found: r.found === true,
      evidence: clean(r.evidence) || null,
    });
  }

  const optimizedResume = clean(raw.optimizedResume);
  if (requirements.length === 0 || !optimizedResume) return null;

  const byImportance = (a: { importance: Importance }, b: { importance: Importance }) =>
    IMPORTANCE_WEIGHT[b.importance] - IMPORTANCE_WEIGHT[a.importance];

  return {
    score: computeCompatibilityScore(requirements),
    summary: clean(raw.summary),
    found: requirements
      .filter((r) => r.found)
      .map(({ term, importance, evidence }) => ({ term, importance, evidence }))
      .sort(byImportance),
    missing: requirements
      .filter((r) => !r.found)
      .map(({ term, importance }) => ({ term, importance }))
      .sort(byImportance),
    improvements: (Array.isArray(raw.improvements) ? raw.improvements : [])
      .map((i) => ({ title: clean(i?.title), detail: clean(i?.detail) }))
      .filter((i) => i.title || i.detail)
      .slice(0, 10),
    optimizedResume,
  };
}
