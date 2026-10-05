import { describe, it, expect } from "vitest";
import { buildResult, genericFallbackResult } from "@/lib/assessment";
import type { PhotoAssessment } from "@/lib/types";

const photo: PhotoAssessment = {
  suitability: "great", score: 91, lowerFaceObscured: false,
  areaEnhancements: { jawline: 70 }, framingAdequate: true,
  focusFindings: ["jawline_softening"],
  narrative: { headline: "Photo guide", narrative: "Visible jawline detail.", observedAreas: ["jawline"], encouragement: "Discuss with a clinician." },
};

describe("optional retake results", () => {
  it("preserves a usable single-area guide without requiring neck findings", () => {
    const result = buildResult(photo, true);
    expect(result.framingAdequate).toBe(true);
    expect(result.narrative.observedAreas).toEqual(["jawline"]);
    expect(result.focusFindings).toEqual(["jawline_softening"]);
  });

  it("discards contradictory findings when an unreadable photo continues without a retake", () => {
    const result = buildResult({ ...photo, framingAdequate: false }, true);
    expect(result.framingAdequate).toBe(false);
    expect(result.bucket).toBe("consultation");
    expect(result.narrativeSource).toBe("fallback");
    expect(result.narrative.observedAreas).toEqual([]);
    expect(result.focusFindings).toEqual([]);
    expect(result.areaEnhancements).toEqual({});
    expect(result.narrative.narrative).toContain("without uploading another photo");
  });

  it("does not turn an analysis service failure into a retake requirement", () => {
    const result = genericFallbackResult(true);
    expect(result.framingAdequate).toBe(true);
    expect(result.usedPhoto).toBe(true);
    expect(result.focusFindings).toEqual([]);
    expect(result.narrative.narrative).toContain("don't need to upload another photo");
  });
});
