import type { Step } from "@/store/wizard-store";

/**
 * The client journey shown across the wizard. The AI guide is step 2 of 4, so
 * the result never reads as the end: the free consultation with Dr Ayda is the
 * step that turns the guide into a real plan.
 */
export const JOURNEY = [
  {
    key: "scan",
    label: "Photo scan",
    short: "Scan",
    detail: "A clear selfie with your jawline and neck visible.",
  },
  {
    key: "guide",
    label: "Pre-consultation guide",
    short: "Guide",
    detail: "Your personal Endomax Lift guide, prepared for Dr Ayda.",
  },
  {
    key: "consultation",
    label: "Free consultation",
    short: "Consultation",
    detail: "We call you to book 15 minutes online with Dr Ayda.",
  },
  {
    key: "plan",
    label: "Your treatment plan",
    short: "Plan",
    detail: "Confirmed suitability, treatment areas and price.",
  },
] as const;

/** Index of the journey stage the client is currently on, or -1 on the hero. */
export function journeyIndex(step: Step): number {
  switch (step) {
    case "consent":
    case "scan":
    case "retake":
      return 0;
    case "lead":
      return 1;
    case "result":
      return 2;
    default:
      return -1;
  }
}
