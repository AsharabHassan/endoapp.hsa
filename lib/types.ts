import type { JowlGrade, NeckType } from "./lower-face-profile";
// ─────────────────────────────────────────────────────────────────────────────
// Domain model for the Endomax Lift Suitability Analyzer.
// The scoring engine (lib/scoring.ts) is authoritative over `Bucket`; Claude only
// ever writes narrative copy — it never decides suitability.
// ─────────────────────────────────────────────────────────────────────────────

/** The four suitability outcomes. Never a flat "you don't qualify". */
export type Bucket = "great" | "good" | "consultation" | "alternative";

/** Limited, photo-observable findings used for the personalised area explanation. */
export type FocusFinding =
  | "jawline_softening"
  | "under_chin_fullness"
  | "neck_softening"
  | "jowl_fullness"
  | "neck_folds"
  | "neck_crepiness"
  | "neck_horizontal_lines"
  | "neck_vertical_bands"
  | "mid_face_softening";

export interface AreaObservation {
  finding: FocusFinding;
  /** A short description of visible shape or texture, without inferring tissue health. */
  observation: string;
}

/** Areas of concern a respondent can select. */
export type AreaId =
  | "jawline"
  | "chin"
  | "neck"
  | "cheeks"
  | "undereye"
  | "body";

/** Medical conditions screened in the contraindication question. */
export type ConditionId =
  | "infection"
  | "bloodThinners"
  | "autoimmune"
  | "photosensitivity"
  | "keloid"
  | "systemic"
  | "none";

/** Structured, typed answers produced by the quiz. */
export interface QuizAnswers {
  laxity: "firm" | "early" | "noticeable" | "severe" | "unsure";
  areas: AreaId[];
  age: "under25" | "25-35" | "36-45" | "46-55" | "56-65" | "over65";
  skin: "healthy" | "thin-sun" | "very-thin";
  pregnant: "yes" | "no";
  conditions: ConditionId[];
  smoker: "no" | "willing" | "not-willing";
  recentTreatment: "no" | "yes";
  expectation: "subtle" | "moderate" | "dramatic";
  goodHealth: "yes" | "partly" | "no";
}

/** Machine-readable reason a hard flag fired. */
export type HardFlag =
  | "pregnancy"
  | "active-infection"
  | "medical-condition"
  | "severe-laxity"
  | "dramatic-expectation"
  | "poor-health";

/** Output of the deterministic scoring engine. */
export interface ScoreResult {
  bucket: Bucket;
  /** 0–100 normalized suitability score (presentational). */
  score: number;
  hardFlags: HardFlag[];
  /** True when a soft flag forced a consultation routing. */
  softFlagged: boolean;
  /** Short, human-readable reason for the routing (used as a fallback narrative seed). */
  routedReason: string;
}

/** The narrative portion Claude is allowed to author (no bucket, no score). */
export interface ClaudeNarrative {
  headline: string;
  /** 2–3 short paragraphs, personalized-but-careful, cosmetic not diagnostic. */
  narrative: string;
  /** Areas Claude observed/affirmed, phrased in general terms. */
  observedAreas: string[];
  encouragement: string;
}

/** The full result returned by /api/analyze and rendered on the result screen. */
export interface AnalyzeResult extends ScoreResult {
  narrative: ClaudeNarrative;
  /** Whether the narrative came from Claude or the deterministic fallback. */
  narrativeSource: "claude" | "fallback";
  /** True when a photo was analyzed (vs. quiz-only path). */
  usedPhoto: boolean;
  /** True when a dense beard hides the jawline/under-chin/neck from the photo read. */
  lowerFaceObscured: boolean;
  /** Indicative per-region enhancement potential (0–100), keyed by RegionKey. */
  areaEnhancements: Record<string, number>;
  /** False when the photo doesn't clearly show the lower face/neck — prompt a retake. */
  framingAdequate: boolean;
  /** Up to three visible, treatment-relevant observations; empty if unreadable. */
  focusFindings?: FocusFinding[];
  areaObservations?: AreaObservation[];
  /** Lower-face profile: the visual jowl grade and neck type (see lib/lower-face-profile.ts). */
  jowlGrade?: JowlGrade;
  neckType?: NeckType;
}

/** Lead captured at the gate. */
export interface Lead {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Separate PECR marketing consent. */
  marketingConsent: boolean;
}

/** Request body for POST /api/analyze. */
export interface AnalyzeRequest {
  imageBase64: string | null;
  imageMediaType?: "image/jpeg" | "image/png" | "image/webp";
  /** Explicit consent to process the face image. Required when imageBase64 present. */
  imageConsent: boolean;
}

/** Claude's raw assessment of the photo: a cosmetic suitability read + narrative. */
export interface PhotoAssessment {
  /** The suitability outcome Claude chose, mapped to a Bucket server-side. */
  suitability: Bucket;
  /** Claude's 0–100 suitability score for this face; clamped to the bucket band. */
  score: number;
  narrative: ClaudeNarrative;
  /** True when a dense beard hides the jawline/under-chin/neck from the photo read. */
  lowerFaceObscured: boolean;
  /** Indicative per-region enhancement potential (0–100), keyed by RegionKey. */
  areaEnhancements: Record<string, number>;
  /** False when the photo doesn't clearly show the lower face/neck — prompt a retake. */
  framingAdequate: boolean;
  focusFindings?: FocusFinding[];
  areaObservations?: AreaObservation[];
  /** Lower-face profile: the visual jowl grade and neck type (see lib/lower-face-profile.ts). */
  jowlGrade?: JowlGrade;
  neckType?: NeckType;
}

/** Request body for POST /api/lead. */
export interface LeadRequest {
  lead: Lead;
  result: AnalyzeResult;
  metaEventId?: string;
}
