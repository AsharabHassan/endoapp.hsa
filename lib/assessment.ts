import type { AnalyzeResult, Bucket, PhotoAssessment } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Maps Claude's photo assessment into the full result, and provides a safe
// generic fallback (always "consultation") for when the vision call fails.
// ─────────────────────────────────────────────────────────────────────────────

// Per-bucket display bands. Claude's raw score is clamped into the band for the
// outcome it chose, so the number varies photo-to-photo while staying coherent
// with the verdict (and within each bucket's gauge band in lib/constants.ts).
const BANDS: Record<Bucket, [number, number]> = {
  great: [80, 99],
  good: [62, 86],
  consultation: [50, 74],
  alternative: [38, 62],
};

/** Clamp Claude's 0–100 score into the chosen bucket's band. */
export function scoreInBucket(bucket: Bucket, score: number): number {
  const [lo, hi] = BANDS[bucket];
  if (!Number.isFinite(score)) return Math.round((lo + hi) / 2);
  return Math.max(lo, Math.min(hi, Math.round(score)));
}

/** Band midpoint — used when there's no Claude score (no-photo / error fallback). */
export function scoreForBucket(bucket: Bucket): number {
  const [lo, hi] = BANDS[bucket];
  return Math.round((lo + hi) / 2);
}

export function buildResult(
  assessment: PhotoAssessment,
  usedPhoto: boolean,
): AnalyzeResult {
  // Continuing without a retake must never surface unsupported photo findings.
  if (!assessment.framingAdequate) {
    return {
      ...genericFallbackResult(usedPhoto),
      framingAdequate: false,
      narrative: {
        headline: "Your next step is a conversation",
        narrative: "Your photo was received, but there isn't enough visible detail for a personalised photo guide. You can still discuss your goals and options with Dr Ayda without uploading another photo.",
        observedAreas: [],
        encouragement: "Book a free 15-minute online consultation. Dr Ayda can explain the next steps; a qualified practitioner confirms treatment suitability and safety.",
      },
    };
  }
  return {
    bucket: assessment.suitability,
    score: scoreInBucket(assessment.suitability, assessment.score),
    hardFlags: [],
    softFlagged: false,
    routedReason: "",
    narrative: assessment.narrative,
    narrativeSource: "claude",
    usedPhoto,
    lowerFaceObscured: assessment.lowerFaceObscured,
    areaEnhancements: assessment.areaEnhancements,
    framingAdequate: assessment.framingAdequate,
    focusFindings: assessment.focusFindings ?? [],
    areaObservations: assessment.areaObservations ?? [],
    jowlGrade: assessment.jowlGrade ?? "unclear",
    neckType: assessment.neckType ?? "unclear",
  };
}

/** Safe default when the photo can't be analysed — routes to a consultation. */
export function genericFallbackResult(usedPhoto: boolean): AnalyzeResult {
  return {
    bucket: "consultation",
    score: scoreForBucket("consultation"),
    hardFlags: [],
    softFlagged: false,
    routedReason: "",
    narrative: {
      headline: "Let's discuss your options with Dr Ayda",
      narrative:
        "We couldn't complete the photo analysis this time. You can still discuss your goals with Dr Ayda in a free 15-minute online consultation, with a phone call available if needed. You don't need to upload another photo to book.",
      observedAreas: [],
      encouragement:
        "Book your free online consultation whenever you're ready. A qualified practitioner confirms treatment suitability and safety.",
    },
    narrativeSource: "fallback",
    usedPhoto,
    lowerFaceObscured: false,
    areaEnhancements: {},
    // An analysis failure isn't a framing problem — don't push a retake here.
    framingAdequate: true,
    focusFindings: [],
  };
}
