// ─────────────────────────────────────────────────────────────────────────────
// "Your lower-face profile": the TYPE of jowl and neck change the photo appears
// consistent with, shown first in the result and the PDF — what it is, why it
// happens, how the Endomax Lift helps, and how well that type typically fits the
// treatment. Visual grading from a selfie only; Dr Ayda confirms at consultation.
// ─────────────────────────────────────────────────────────────────────────────

export const JOWL_GRADES = ["none", "mild", "moderate", "advanced", "unclear"] as const;
export const NECK_TYPES = ["minimal", "skin_laxity", "submental_fullness", "mixed", "banding", "unclear"] as const;
export type JowlGrade = (typeof JOWL_GRADES)[number];
export type NeckType = (typeof NECK_TYPES)[number];

/** How well a type typically fits the Endomax Lift. */
export type EndoliftFit = "strong" | "good" | "partial" | "review";

export const FIT_LABEL: Record<EndoliftFit, string> = {
  strong: "Strong fit for Endomax Lift",
  good: "Good fit for Endomax Lift",
  partial: "Endomax Lift can help part of this",
  review: "Dr Ayda to advise on the best approach",
};

export interface ProfileEntry {
  /** Clinical-style name shown as the heading. */
  name: string;
  /** Plain-English name. */
  commonName: string;
  what: string;
  why: string;
  howItHelps: string;
  fit: EndoliftFit;
}

export const JOWLS: Record<Exclude<JowlGrade, "unclear">, ProfileEntry> = {
  none: {
    name: "Defined jawline",
    commonName: "no visible jowling",
    what: "The jaw edge reads clean and continuous from the chin back towards the ear, without tissue sitting over it.",
    why: "Skin firmness and the deeper supporting tissues are still holding the lower face in place.",
    howItHelps: "Endomax Lift is usually a preventative choice here — controlled heat beneath the skin stimulates new collagen to help keep the jawline crisp as it would naturally start to soften.",
    fit: "good",
  },
  mild: {
    name: "Early jowl formation (mild)",
    commonName: "early jowls",
    what: "A slight softening along the jaw edge, with a small amount of tissue beginning to gather just in front of the jaw corner.",
    why: "From the mid-30s collagen and elastin fall, and the skin and small fat pockets of the lower face start to settle downwards.",
    howItHelps: "This is the ideal stage for Endomax Lift: a fine 1470nm laser fibre tightens the skin from within and can reduce small pockets of fat along the jaw, restoring a sharper line without surgery.",
    fit: "strong",
  },
  moderate: {
    name: "Moderate jowl formation",
    commonName: "noticeable jowls",
    what: "A visible bulge interrupts the jawline either side of the chin, so the jaw edge no longer runs in one clean line.",
    why: "Skin laxity has progressed and the jowl fat pad has descended below the jaw border, which weakening support ligaments allow over time.",
    howItHelps: "Endomax Lift targets both parts of a moderate jowl — laser lipolysis reduces the fat sitting over the jaw while thermal contraction and new collagen tighten the skin around it, re-defining the jawline over the following months.",
    fit: "strong",
  },
  advanced: {
    name: "Advanced jowl formation",
    commonName: "heavy jowls",
    what: "Pronounced tissue hangs below the jaw line, with the lower face visibly heavier and the jaw edge largely lost.",
    why: "Long-standing skin laxity with significant descent of the deeper facial tissues and excess skin.",
    howItHelps: "Endomax Lift can still tighten and refine the skin, but heavy descent with excess skin may need a combined plan — Dr Ayda will be honest about what each option can achieve for you.",
    fit: "review",
  },
};

export const NECKS: Record<Exclude<NeckType, "unclear">, ProfileEntry> = {
  minimal: {
    name: "Well-defined neck",
    commonName: "minimal neck change",
    what: "A clear angle between the chin and neck, with smooth, firm-looking neck skin.",
    why: "Skin elasticity and the tissues beneath the chin are still well supported.",
    howItHelps: "Endomax Lift can be used preventatively to stimulate collagen and maintain the definition of the chin-to-neck angle.",
    fit: "good",
  },
  skin_laxity: {
    name: "Neck skin laxity",
    commonName: "loose or crepey neck skin",
    what: "The neck skin looks looser or finely crinkled, with soft folds rather than a fuller chin.",
    why: "Neck skin is thin and has few oil glands, so it loses collagen and elastin early — sun exposure and time make it looser and crepier.",
    howItHelps: "Skin-led laxity is what Endomax Lift's thermal tightening is designed for: controlled heat contracts the existing collagen and triggers new collagen, so the neck skin looks firmer and smoother over 3–6 months.",
    fit: "strong",
  },
  submental_fullness: {
    name: "Submental fullness",
    commonName: "a 'double chin'",
    what: "Fullness sits beneath the chin, blunting the angle between the chin and neck even though the skin itself looks fairly firm.",
    why: "A pocket of fat beneath the chin, often genetic or weight-related, which diet and exercise rarely shift on their own.",
    howItHelps: "Endomax Lift's laser lipolysis gently melts the small fat pocket under the chin while tightening the skin over it, so the chin-to-neck angle becomes more defined without surgery or long downtime.",
    fit: "strong",
  },
  mixed: {
    name: "Combined laxity and fullness",
    commonName: "a full, softening neck",
    what: "Both fullness beneath the chin and looser neck skin are visible, so the jaw and neck blend together.",
    why: "Fat beneath the chin combined with skin that has lost firmness — the most common pattern after the early 40s.",
    howItHelps: "Endomax Lift treats both at once — laser lipolysis reduces the fullness and thermal contraction tightens the skin — which is why this combined pattern responds well to it.",
    fit: "strong",
  },
  banding: {
    name: "Visible neck bands",
    commonName: "vertical neck cords",
    what: "Vertical cord-like contours run down the front of the neck.",
    why: "The thin neck muscle (platysma) can separate and become more prominent with age, especially when the neck tenses.",
    howItHelps: "Endomax Lift improves the skin around the bands, but the bands themselves come from muscle — Dr Ayda will look at your neck at rest and in motion and may combine it with a muscle-relaxing treatment.",
    fit: "partial",
  },
};

export interface LowerFaceProfile {
  jowls: (ProfileEntry & { key: Exclude<JowlGrade, "unclear"> }) | null;
  neck: (ProfileEntry & { key: Exclude<NeckType, "unclear"> }) | null;
}

export function isJowlGrade(v: unknown): v is JowlGrade {
  return typeof v === "string" && (JOWL_GRADES as readonly string[]).includes(v);
}
export function isNeckType(v: unknown): v is NeckType {
  return typeof v === "string" && (NECK_TYPES as readonly string[]).includes(v);
}

/** The profile to show, or nulls when the photo couldn't be read for that area. */
export function lowerFaceProfile(r: { jowlGrade?: JowlGrade; neckType?: NeckType; usedPhoto: boolean; framingAdequate: boolean; lowerFaceObscured: boolean }): LowerFaceProfile {
  if (!r.usedPhoto || !r.framingAdequate || r.lowerFaceObscured) return { jowls: null, neck: null };
  const j = r.jowlGrade && r.jowlGrade !== "unclear" ? r.jowlGrade : null;
  const n = r.neckType && r.neckType !== "unclear" ? r.neckType : null;
  return {
    jowls: j ? { key: j, ...JOWLS[j] } : null,
    neck: n ? { key: n, ...NECKS[n] } : null,
  };
}
