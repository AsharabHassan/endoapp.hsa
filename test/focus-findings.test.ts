import { describe, expect, it } from "vitest";
import { focusExplanations, focusRegionKeys, parseAreaObservations } from "@/lib/focus-findings";
import type { AnalyzeResult } from "@/lib/types";

const result: AnalyzeResult = {
  bucket: "good",
  score: 72,
  hardFlags: [],
  softFlagged: false,
  routedReason: "",
  narrative: { headline: "Guide", narrative: "", observedAreas: [], encouragement: "" },
  narrativeSource: "claude",
  usedPhoto: true,
  lowerFaceObscured: false,
  areaEnhancements: {},
  framingAdequate: true,
  focusFindings: ["jawline_softening", "under_chin_fullness"],
};

describe("personalised focus explanations", () => {
  it("keeps photo-specific detail and pairs neck bands with the correct treatment limitation", () => {
    const personalised = { ...result, focusFindings: [], areaObservations: [
      { finding: "neck_vertical_bands" as const, observation: "Two vertical cord-like contours appear centrally on your neck." },
    ] };
    const [explanation] = focusExplanations(personalised);
    expect(explanation.observation).toContain("centrally");
    expect(explanation.mechanism).toContain("limited effect");
    expect(explanation.expectedChange).toContain("at rest and in motion");
    expect(focusRegionKeys(personalised)).toEqual(["neck"]);
  });

  it("rejects unknown findings, empty observations and duplicate codes", () => {
    expect(parseAreaObservations([
      { finding: "unrecognised", observation: "Unknown" },
      { finding: "neck_folds", observation: " " },
      { finding: "jowl_fullness", observation: "Visible local fullness." },
      { finding: "jowl_fullness", observation: "Duplicate." },
    ])).toEqual([{ finding: "jowl_fullness", observation: "Visible local fullness." }]);
  });

  it("does not expose detailed observations after failed analysis", () => {
    expect(focusExplanations({ ...result, narrativeSource: "fallback", areaObservations: [
      { finding: "neck_folds", observation: "Folds." },
    ] })).toEqual([]);
  });
  it("gives a visible observation and reason for each selected area", () => {
    const explanations = focusExplanations(result);
    expect(explanations.map((item) => item.area)).toEqual(["Jawline and jowls", "Under the chin"]);
    expect(explanations.every((item) => item.observation && item.whyDiscuss)).toBe(true);
    expect(focusRegionKeys(result)).toEqual(["jawline", "chin"]);
  });

  it("does not invent a focus for an unreadable photo or analysis failure", () => {
    expect(focusExplanations({ ...result, framingAdequate: false })).toEqual([]);
    expect(focusExplanations({ ...result, narrativeSource: "fallback" })).toEqual([]);
  });

  it("does not claim a personalised area when a dense beard hides the lower face", () => {
    const obscured = { ...result, lowerFaceObscured: true,
      focusFindings: ["jawline_softening", "mid_face_softening"] as AnalyzeResult["focusFindings"] };
    expect(focusRegionKeys(obscured)).toEqual([]);
  });
});
