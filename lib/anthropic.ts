import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Bucket, FocusFinding, PhotoAssessment } from "./types";
import { serverEnv } from "./env";
import { SYSTEM_ENDOLIFT } from "./prompts/system-endolift";
import { RESULT_SCHEMA } from "./prompts/result-schema";
import { toRegionKey } from "./face-regions";
import type { MediaType } from "@/store/wizard-store";
import { FOCUS_FINDINGS as FINDING_CODES, parseAreaObservations } from "./focus-findings";
import { endoliftNote, skinScanEndolift } from "./skinscan";
import { reportAgreement } from "./skinscan-agreement";
import { isJowlGrade, isNeckType } from "./lower-face-profile";

// ─────────────────────────────────────────────────────────────────────────────
// Server-only Claude Vision call. The system prompt is sent as a cached prefix;
// the photo goes in the user turn. Claude both chooses the cosmetic suitability
// outcome and writes the narrative; the route maps `suitability` to a Bucket.
// ─────────────────────────────────────────────────────────────────────────────

const VALID: Bucket[] = ["great", "good", "consultation", "alternative"];
const MAP: Record<string, Bucket> = {
  strong: "great",
  good: "good",
  consultation: "consultation",
  alternative: "alternative",
};
const FOCUS_FINDINGS = new Set<FocusFinding>(FINDING_CODES);

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: serverEnv().ANTHROPIC_API_KEY });
  return client;
}

export async function assessPhoto(params: {
  imageBase64: string;
  imageMediaType: MediaType;
}): Promise<PhotoAssessment> {
  const env = serverEnv();
  // The clinic's own model reads the photo first; its signals go to Claude.
  const scan = await skinScanEndolift(params.imageBase64);

  const message = await getClient().messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 1600,
    // Sonnet 5.5 rejects { type: "disabled" }; "between_tools" is its thinking-off
    // mode. SDK 0.100 predates the type, hence the cast.
    thinking: { type: "between_tools" } as unknown as Anthropic.ThinkingConfigParam,
    system: [
      {
        type: "text",
        text: SYSTEM_ENDOLIFT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: RESULT_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: params.imageMediaType,
              data: params.imageBase64,
            },
          },
          {
            type: "text",
            text: "Assess this selfie and produce the personalised Endomax Lift result as the structured fields.",
          },
          ...(scan ? [{ type: "text" as const, text: endoliftNote(scan) }] : []),
        ],
      },
    ],
  });

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("no text block");
  const raw = JSON.parse(block.text) as {
    suitability: string;
    laxityFit: number;
    skinQuality: number;
    areaFit: number;
    lowerFaceObscured: boolean;
    areaEnhancements: { area: string; enhancementPercent: number }[];
    framingAdequate: boolean;
    focusFindings: string[];
    areaObservations: unknown;
    jowlGrade: unknown;
    neckType: unknown;
    headline: string;
    narrative: string;
    observedAreas: string[];
    encouragement: string;
  };
  const bucket = MAP[raw.suitability];
  if (
    !bucket ||
    !VALID.includes(bucket) ||
    typeof raw.headline !== "string" ||
    typeof raw.narrative !== "string" ||
    !Array.isArray(raw.observedAreas) ||
    typeof raw.encouragement !== "string"
  ) {
    throw new Error("malformed assessment");
  }

  // The score is the sum of Claude's three observed factors (0–100). Summing
  // independently-judged parts gives a genuine, face-specific number that varies
  // photo-to-photo, instead of anchoring to a band midpoint. Missing/invalid
  // factors → NaN, and buildResult falls back to the bucket midpoint.
  const factors = [raw.laxityFit, raw.skinQuality, raw.areaFit];
  const score = factors.every((n) => typeof n === "number" && Number.isFinite(n))
    ? factors.reduce((a, b) => a + b, 0)
    : NaN;

  // Map Claude's per-area enhancement estimates onto our region keys, clamped
  // 0–100. Keep the strongest figure when two labels map to the same region.
  const areaEnhancements: Record<string, number> = {};
  if (Array.isArray(raw.areaEnhancements)) {
    for (const item of raw.areaEnhancements) {
      const region = toRegionKey(String(item?.area ?? ""));
      const pct = Number(item?.enhancementPercent);
      if (!region || !Number.isFinite(pct)) continue;
      const v = Math.max(0, Math.min(100, Math.round(pct)));
      if (areaEnhancements[region] === undefined || v > areaEnhancements[region]) {
        areaEnhancements[region] = v;
      }
    }
  }

  const result: PhotoAssessment = {
    suitability: bucket,
    score,
    lowerFaceObscured: raw.lowerFaceObscured === true,
    areaEnhancements,
    framingAdequate: raw.framingAdequate !== false,
    focusFindings: raw.framingAdequate === false || raw.lowerFaceObscured === true ? [] :
      [...new Set(Array.isArray(raw.focusFindings) ? raw.focusFindings : [])]
        .filter((finding): finding is FocusFinding => FOCUS_FINDINGS.has(finding as FocusFinding))
        .slice(0, 3),
    areaObservations: raw.framingAdequate === false || raw.lowerFaceObscured === true ? [] : parseAreaObservations(raw.areaObservations),
    jowlGrade: isJowlGrade(raw.jowlGrade) ? raw.jowlGrade : "unclear",
    neckType: isNeckType(raw.neckType) ? raw.neckType : "unclear",
    narrative: {
      headline: raw.headline,
      narrative: raw.narrative,
      observedAreas: raw.observedAreas,
      encouragement: raw.encouragement,
    },
  };

  // SkinScan agreement log (no effect on the result): only for readable photos.
  // SkinScan treats an area as a likely focus at >= 0.5.
  if (scan && result.framingAdequate && !result.lowerFaceObscured) {
    const areas = ["chin", "neck", "cheeks"] as const;
    const scanAreas = areas.filter((a) => scan.focus[a] >= 0.5);
    const claudeAreas = [...new Set((result.focusFindings ?? []).map(findingArea).filter((a): a is string => a !== null))];
    const agree: Record<string, boolean> = {};
    for (const a of areas) agree[`agree_${a}`] = scanAreas.includes(a) === claudeAreas.includes(a);
    agree.agree_strong_candidate = (scan.strong_candidate >= 0.5) === (result.suitability === "great");
    reportAgreement(
      "endolift",
      { focus: scan.focus, focusAreas: scanAreas, strong_candidate: scan.strong_candidate, version: scan.version },
      { focusAreas: claudeAreas, strongCandidate: result.suitability === "great", jowlGrade: result.jowlGrade, neckType: result.neckType },
      agree,
    );
  }
  return result;
}

/** Claude's finding codes → SkinScan's focus areas (jawline has no SkinScan equivalent). */
function findingArea(f: FocusFinding): string | null {
  if (f === "under_chin_fullness") return "chin";
  if (f.startsWith("neck_")) return "neck";
  if (f === "mid_face_softening") return "cheeks";
  return null;
}
