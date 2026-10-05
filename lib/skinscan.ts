import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
// HSA SkinScan — the clinic's own AI service, `/endolift` endpoint. A model
// trained on 1,588 past HSA Endomax Lift reports reads the cheek, jawline and
// chin close-ups and returns how likely each area is to be a focus, how likely
// the face reads as a strong candidate, and an enhancement-potential estimate.
// Passed to Claude as a supporting signal. Optional: with SKINSCAN_URL unset, or
// on any error/timeout, the analysis runs on Claude alone. The image goes only
// to the clinic's own service and is never stored there.
// ─────────────────────────────────────────────────────────────────────────────

export interface EndoliftReading {
  focus: { chin: number; cheeks: number; neck: number };
  strong_candidate: number;
  enhancement: { jawline: number; chin: number };
  version?: string;
}

const TIMEOUT_MS = 10_000;

export async function skinScanEndolift(imageBase64: string): Promise<EndoliftReading | null> {
  const url = process.env.SKINSCAN_URL;
  if (!url) return null;
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/endolift`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SKINSCAN_API_KEY ? { "x-skinscan-key": process.env.SKINSCAN_API_KEY } : {}),
      },
      body: JSON.stringify({ image_base64: imageBase64 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as EndoliftReading & { ok?: boolean };
    if (data.ok) console.info("[skinscan] endolift reading", { version: data.version, focus: data.focus, strong: data.strong_candidate });
    return data.ok ? data : null;
  } catch (err) {
    console.error("[skinscan] unavailable — continuing with Claude alone:", err instanceof Error ? err.name : err);
    return null;
  }
}

const pct = (p: number) => `${Math.round(p * 100)}%`;

/** The reading as a short note for Claude's user turn. */
export function endoliftNote(r: EndoliftReading): string {
  return (
    "HSA SkinScan reading of this photo (the clinic's own model, trained on its past Endomax Lift assessments — a supporting " +
    "signal; trust what you clearly see in the photo when they disagree, and never quote these numbers to the reader): " +
    `likelihood each area is a focus — under-chin ${pct(r.focus.chin)}, neck ${pct(r.focus.neck)}, mid-face/cheeks ${pct(r.focus.cheeks)}; ` +
    `reads as a strong candidate ${pct(r.strong_candidate)}; typical enhancement-potential band — jawline ~${r.enhancement.jawline}%, ` +
    `under-chin ~${r.enhancement.chin}%.`
  );
}
