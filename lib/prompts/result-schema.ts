import { FOCUS_FINDINGS } from "../focus-findings";
import { JOWL_GRADES, NECK_TYPES } from "../lower-face-profile";

export const RESULT_SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    suitability: { type: "string", enum: ["strong", "good", "consultation", "alternative"], description: "Legacy routing only; not confirmed medical suitability. Use consultation when unclear." },
    laxityFit: { type: "number", description: "Legacy routing field 0–40; never an outcome prediction." },
    skinQuality: { type: "number", description: "Return 0: skin resilience cannot be measured from this selfie." },
    areaFit: { type: "number", description: "Legacy area relevance field 0–30; not a probability of improvement." },
    lowerFaceObscured: { type: "boolean", description: "True only when dense beard hair hides the relevant lower-face skin. Ordinary stubble is acceptable." },
    areaEnhancements: {
      type: "array", description: "Return an empty array. No validated percentage predictor is available.",
      items: {
        type: "object", additionalProperties: false,
        properties: { area: { type: "string" }, enhancementPercent: { type: "number" } },
        required: ["area", "enhancementPercent"],
      },
    },
    jowlGrade: { type: "string", enum: JOWL_GRADES, description: "Visual jowl grade: none, mild, moderate, advanced; unclear when the jawline cannot be read." },
    neckType: { type: "string", enum: NECK_TYPES, description: "Which neck pattern the photo appears most consistent with; unclear when the neck/under-chin cannot be read." },
    framingAdequate: { type: "boolean", description: "True if at least one lower-face area is readable. Only false when none can be described. Retakes remain optional." },
    focusFindings: {
      type: "array", description: "Up to three genuinely visible patterns, matching areaObservations. Never add an area just because it is visible.",
      items: { type: "string", enum: FOCUS_FINDINGS },
    },
    areaObservations: {
      type: "array", description: "Up to three specific patterns. Prioritise jawline and neck if both have findings. Describe visible location, contour or texture, without diagnosing its cause.",
      items: {
        type: "object", additionalProperties: false,
        properties: {
          finding: { type: "string", enum: FOCUS_FINDINGS },
          observation: { type: "string", description: "One personalised sentence about the visible pattern and location; at most 40 words." },
        },
        required: ["finding", "observation"],
      },
    },
    headline: { type: "string", description: "6–10 words naming the visible focus, without promising results." },
    narrative: { type: "string", description: "Two short sentences, up to 55 words: visible pattern then relevant treatment mechanism and possible direction of change." },
    observedAreas: { type: "array", items: { type: "string" }, description: "Only areas with supported findings; empty when unreadable." },
    encouragement: { type: "string", description: "Invite the free 15-minute online consultation with Dr Ayda, with phone fallback." },
  },
  required: ["suitability", "laxityFit", "skinQuality", "areaFit", "lowerFaceObscured", "jowlGrade", "neckType", "areaEnhancements", "framingAdequate", "focusFindings", "areaObservations", "headline", "narrative", "observedAreas", "encouragement"],
} as const;
