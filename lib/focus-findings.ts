import type { AnalyzeResult, AreaObservation, FocusFinding } from "./types";
import type { RegionKey } from "./face-regions";

export interface FocusExplanation {
  finding: FocusFinding;
  region: RegionKey;
  area: string;
  pattern: string;
  observation: string;
  mechanism: string;
  expectedChange: string;
  whyDiscuss: string;
}

type Explanation = Omit<FocusExplanation, "finding" | "whyDiscuss">;
const EXPLANATIONS: Record<FocusFinding, Explanation> = {
  jawline_softening: {
    region: "jawline", area: "Jawline and jowls", pattern: "Softer jawline definition",
    observation: "The edge of the jaw appears softly blended with the tissue beneath it in this photo.",
    mechanism: "A fine laser fibre delivers controlled heat beneath the skin. If skin laxity contributes to this softer edge, tissue contraction and collagen remodelling may improve definition.",
    expectedChange: "A firmer-looking outline with a more defined transition below the jaw. The extent depends on skin looseness and the tissue beneath it.",
  },
  jowl_fullness: {
    region: "jawline", area: "Jawline and jowls", pattern: "Jowl-like fullness",
    observation: "A small area of fullness appears to interrupt the jawline near the lower cheek.",
    mechanism: "Endomax Lift can target selected areas of lower-face laxity and superficial fat. Controlled laser heating may tighten the skin around a jowl-like contour; examination establishes which tissue is responsible.",
    expectedChange: "A smoother jawline transition may be possible. Heavier tissue descent or structural volume changes can need a different approach.",
  },
  under_chin_fullness: {
    region: "chin", area: "Under the chin", pattern: "Fullness beneath the chin",
    observation: "The area beneath the chin appears fuller, with a softer chin-to-neck transition.",
    mechanism: "Where superficial fat and skin laxity are responsible, a clinician may use the laser's thermal effect to address local fat and encourage skin contraction.",
    expectedChange: "A more defined chin-to-neck contour may be possible. A selfie cannot separate fat from skin folds, muscle or underlying anatomy.",
  },
  neck_softening: {
    region: "neck", area: "Neck", pattern: "Softer neck contour",
    observation: "The visible neck contour appears softly defined in this photo.",
    mechanism: "Controlled heat beneath the skin can trigger tissue contraction and collagen remodelling. This can help selected cases of mild to moderate skin laxity.",
    expectedChange: "The skin may look firmer and the neck contour smoother over the following months. Loose skin, muscle bands and deeper fullness respond differently.",
  },
  neck_folds: {
    region: "neck", area: "Neck", pattern: "Visible skin folds",
    observation: "Loose-looking folds are visible along the neck contour.",
    mechanism: "If these folds reflect mild to moderate skin laxity, laser-induced contraction and collagen remodelling may improve how the skin sits. Head position can also create folds.",
    expectedChange: "Some smoothing of loose-looking skin may be possible. Endomax Lift does not remove excess skin; substantial folds may need other options.",
  },
  neck_crepiness: {
    region: "neck", area: "Neck", pattern: "Fine, crepey-looking texture",
    observation: "Fine surface crinkling is visible on the neck in this photo.",
    mechanism: "The laser's controlled thermal effect stimulates a tissue-remodelling response. In suitable skin this may improve firmness and the appearance of fine texture.",
    expectedChange: "A smoother, firmer-looking surface may develop gradually. Lighting, dryness and skin quality affect this appearance and need checking.",
  },
  neck_horizontal_lines: {
    region: "neck", area: "Neck", pattern: "Horizontal neck lines",
    observation: "Horizontal creases are visible across the neck.",
    mechanism: "Small studies have explored Endolift for horizontal neck wrinkles. Thermal remodelling may soften some lines, but a crease can remain even when the surrounding skin becomes firmer.",
    expectedChange: "Some softening of the lines may be possible. Deep or longstanding creases may need a separate treatment plan.",
  },
  neck_vertical_bands: {
    region: "neck", area: "Neck", pattern: "Vertical band-like contours",
    observation: "Vertical cord-like contours are visible in the neck area.",
    mechanism: "Endomax Lift works on skin and selected superficial tissue. If muscle activity creates these contours, skin tightening alone may have limited effect on the bands themselves.",
    expectedChange: "Surrounding skin may improve when laxity is present. Dr Ayda needs to assess the neck at rest and in motion before recommending how to address the bands.",
  },
  mid_face_softening: {
    region: "cheeks", area: "Mid-face and cheeks", pattern: "Softer cheek contour",
    observation: "The visible cheek contour appears softly defined in this photo.",
    mechanism: "Where skin laxity contributes, controlled subdermal heating may help improve firmness. Cheek shape also depends on fat distribution and structural support.",
    expectedChange: "A subtle improvement in contour may be possible. Tightening cannot replace lost volume, and unnecessary fat reduction may accentuate hollowness.",
  },
};

export const FOCUS_FINDINGS = Object.keys(EXPLANATIONS) as FocusFinding[];

/** Validate model observations separately so malformed output cannot invent a region. */
export function parseAreaObservations(value: unknown): AreaObservation[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item.finding !== "string" || !Object.hasOwn(EXPLANATIONS, item.finding) ||
        typeof item.observation !== "string" || !item.observation.trim() || seen.has(item.finding)) return [];
    seen.add(item.finding);
    return [{ finding: item.finding as FocusFinding, observation: item.observation.trim().slice(0, 360) }];
  }).slice(0, 3);
}

export function focusExplanations(result: AnalyzeResult): FocusExplanation[] {
  if (!result.usedPhoto || !result.framingAdequate || result.lowerFaceObscured || result.narrativeSource !== "claude") return [];
  const observations = parseAreaObservations(result.areaObservations);
  const findings = [...new Set([...observations.map((item) => item.finding), ...(result.focusFindings ?? [])])]
    .filter((finding): finding is FocusFinding => Object.hasOwn(EXPLANATIONS, finding));
  return findings.slice(0, 3).map((finding) => {
    const explanation = EXPLANATIONS[finding];
    const observation = observations.find((item) => item.finding === finding)?.observation ?? explanation.observation;
    return { finding, ...explanation, observation, whyDiscuss: `${explanation.mechanism} Possible change: ${explanation.expectedChange}` };
  });
}

export function focusRegionKeys(result: AnalyzeResult): RegionKey[] {
  return [...new Set(focusExplanations(result).map(({ region }) => region))];
}
