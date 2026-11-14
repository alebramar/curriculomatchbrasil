import { describe, expect, it } from "vitest";

import {
  MAX_CHARS,
  MIN_CHARS,
  computeCompatibilityScore,
  normalizeAnalysis,
  validateInputs,
} from "@/lib/analysis/core";

describe("compatibility score", () => {
  it("weighs essential requirements twice as much as desirable ones", () => {
    // found: 2 essential (4) + 1 desirable (1) = 5; total: 3 essential (6) + 1 desirable (1) = 7
    const score = computeCompatibilityScore([
      { importance: "essencial", found: true },
      { importance: "essencial", found: true },
      { importance: "essencial", found: false },
      { importance: "desejavel", found: true },
    ]);
    expect(score).toBe(71);
  });

  it("stays within 0 and 100", () => {
    expect(computeCompatibilityScore([{ importance: "essencial", found: false }])).toBe(0);
    expect(computeCompatibilityScore([{ importance: "desejavel", found: true }])).toBe(100);
  });
});

describe("result normalization", () => {
  it("returns no result when the AI output has no requirements or resume", () => {
    expect(
      normalizeAnalysis({
        inputIssue: null,
        summary: "",
        requirements: [],
        improvements: [],
        optimizedResume: "Texto",
      }),
    ).toBeNull();
  });
});

describe("input validation", () => {
  it("requires both fields", () => {
    const errors = validateInputs("", "   ");
    expect(errors.jobDescription).toBeDefined();
    expect(errors.resume).toBeDefined();
  });

  it("rejects texts shorter than the minimum and longer than the maximum", () => {
    expect(validateInputs("a".repeat(MIN_CHARS - 1), "b".repeat(MIN_CHARS)).jobDescription).toBeDefined();
    expect(validateInputs("a".repeat(MIN_CHARS), "b".repeat(MAX_CHARS + 1)).resume).toBeDefined();
    expect(validateInputs("a".repeat(MIN_CHARS), "b".repeat(MIN_CHARS))).toEqual({});
  });
});
