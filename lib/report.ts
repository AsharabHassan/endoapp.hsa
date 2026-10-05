"use client";

import type { AnalyzeResult, Lead } from "./types";
import type { NormalizedPoint } from "@/components/scan/useFaceLandmarker";
import {
  regionMarkers,
  regionRect,
  faceVisibleSide,
  REGION_ORDER,
  REGION_COPY,
  REGION_LABEL,
  type RegionKey,
} from "./face-regions";
import { cropImage } from "./crop";
import {
  BUCKET_META,
  CLINIC,
  BOOKING_URL,
  PRICE_GUIDE,
  DISCLAIMER,
  CONSULTANT,
  SITE_URL,
} from "./constants";
import { buildReportPdf, type ReportArea } from "./report-pdf";
import { focusExplanations, focusRegionKeys } from "./focus-findings";
import { FIT_LABEL, lowerFaceProfile } from "./lower-face-profile";
import type { ReportProfileEntry } from "./report-pdf";

// Mirrors the on-screen FaceConcernMap so the PDF matches what the client saw.
const BEARD_COVERED: RegionKey[] = ["jawline", "chin", "neck"];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = src;
  });
}

async function localImageData(src: string, format: "image/png" | "image/jpeg"): Promise<string | null> {
  try {
    const img = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL(format, .9);
  } catch { return null; }
}

function beardBlurb(r: RegionKey): string {
  return `Your beard covers this area, so we couldn't read it from your photo. The Endomax Lift still works beautifully here beneath a beard — your practitioner will assess your ${REGION_LABEL[
    r
  ].toLowerCase()} precisely in person.`;
}

/** Region plan shared by the annotated image and the area list (consistent numbering). */
function planRegions(
  landmarks: NormalizedPoint[],
  result: AnalyzeResult,
): { region: RegionKey; num: number; flagged: boolean; covered: boolean }[] {
  const wanted = focusRegionKeys(result);
  const regions = REGION_ORDER.filter(
    (r) => wanted.includes(r) && regionMarkers(r, landmarks).length > 0,
  );
  return regions.map((region, i) => ({
    region,
    num: i + 1,
    flagged: true,
    covered: Boolean(result.lowerFaceObscured) && BEARD_COVERED.includes(region),
  }));
}

async function renderAnnotatedFace(
  imageBase64: string,
  mediaType: string,
  landmarks: NormalizedPoint[],
  result: AnalyzeResult,
): Promise<{ url: string; aspect: number } | null> {
  try {
    const img = await loadImage(`data:${mediaType};base64,${imageBase64}`);
    const W = 620;
    const H = Math.max(1, Math.round((W * img.naturalHeight) / img.naturalWidth));
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, W, H);

    const vs = faceVisibleSide(landmarks);
    for (const { region, num, covered } of planRegions(landmarks, result)) {
      let markers = regionMarkers(region, landmarks);
      if (markers.length === 2 && vs !== "both") {
        const sorted = [...markers].sort((a, b) => a.cx - b.cx);
        markers = [vs === "right" ? sorted[1] : sorted[0]];
      }
      for (const e of markers) {
        const cx = e.cx * W;
        const cy = e.cy * H;
        // marker ring
        ctx.beginPath();
        ctx.ellipse(cx, cy, e.rx * W, e.ry * H, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(212,175,55,0.9)";
        ctx.lineWidth = 2;
        ctx.setLineDash(covered ? [6, 5] : []);
        ctx.stroke();
        ctx.setLineDash([]);
        // numbered pin
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.fillStyle = "#d4af37";
        ctx.fill();
        ctx.fillStyle = "#0a0a0a";
        ctx.font = "bold 13px Helvetica, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(num), cx, cy + 0.5);
      }
    }
    // JPEG (not PNG): the canvas is fully opaque (the selfie fills it before the
    // markers are drawn), and jsPDF's JPEG path is reliable where its PNG/alpha
    // path can silently fail — which left the face map invisible in the PDF.
    return { url: canvas.toDataURL("image/jpeg", 0.92), aspect: W / H };
  } catch {
    return null;
  }
}

/**
 * Build the branded suitability report PDF entirely in the browser (renders the
 * annotated face + area crops, then lays them out via buildReportPdf). Returns a
 * PDF Blob. Works with or without a photo (quiz-only → verdict-only report).
 */
export async function generateReportPdf(opts: {
  result: AnalyzeResult;
  imageBase64: string | null;
  imageMediaType: string;
  landmarks: NormalizedPoint[] | null;
  lead: Lead | null;
}): Promise<Blob> {
  const { result, imageBase64, imageMediaType, landmarks, lead } = opts;
  const meta = BUCKET_META[result.bucket];

  let faceImageDataUrl: string | null = null;
  let faceImageAspect: number | undefined;
  let areas: ReportArea[] = [];
  const explanations = focusExplanations(result);

  if (result.usedPhoto && imageBase64 && landmarks) {
    const face = await renderAnnotatedFace(
      imageBase64,
      imageMediaType,
      landmarks,
      result,
    );
    faceImageDataUrl = face?.url ?? null;
    faceImageAspect = face?.aspect;
    const plan = planRegions(landmarks, result);
    areas = await Promise.all(
      plan.map(async ({ region, num, flagged, covered }) => {
        const regionalExplanations = explanations.filter((item) => item.region === region);
        const rect = regionRect(region, landmarks);
        const cropDataUrl = rect
          ? await cropImage(imageBase64, imageMediaType, rect)
          : null;
        return {
          num,
          title: REGION_COPY[region].title,
          blurb: covered
            ? beardBlurb(region)
            : regionalExplanations.length
              ? regionalExplanations.map((item) => `${item.pattern}: ${item.observation} ${item.whyDiscuss}`).join("\n\n")
              : REGION_COPY[region].blurb,
          cropDataUrl,
          covered,
          flagged,
          enhancement: null,
        } satisfies ReportArea;
      }),
    );
  }

  // Keep the explanatory report useful even when the on-device landmark map is unavailable.
  if (result.usedPhoto && imageBase64 && !faceImageDataUrl) {
    const source = `data:${imageMediaType};base64,${imageBase64}`;
    faceImageDataUrl = await localImageData(source, "image/jpeg");
    if (faceImageDataUrl) {
      const image = await loadImage(faceImageDataUrl);
      faceImageAspect = image.naturalWidth / image.naturalHeight;
    }
  }
  if (areas.length === 0 && explanations.length > 0) {
    areas = explanations.map((item, i) => ({
      num: i + 1, title: item.area,
      blurb: `${item.pattern}: ${item.observation} ${item.whyDiscuss}`,
      cropDataUrl: null, covered: false, flagged: true, enhancement: null,
    }));
  }

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [logoDataUrl, doctorPhotoDataUrl] = await Promise.all([
    localImageData("/images/hsa-logo.png", "image/png"),
    localImageData("/images/dr-ayda-soltanzadeh.jpg", "image/jpeg"),
  ]);

  return buildReportPdf({
    clinicName: CLINIC.name,
    treatmentName: "Endomax Lift",
    byline: CLINIC.byline,
    logoDataUrl,
    doctorPhotoDataUrl,
    doctorName: CONSULTANT.name,
    doctorRole: CONSULTANT.role,
    doctorProfile: CONSULTANT.profile,
    calculatorUrl: `${SITE_URL.replace(/\/$/, "")}/offer#finance`,
    palette: {
      bg: [248, 244, 236],
      panel: [238, 228, 209],
      gold: [165, 126, 55],
      goldLt: [186, 145, 73],
      heading: [47, 38, 27],
      body: [83, 71, 56],
      faint: [115, 98, 75],
      line: [205, 187, 155],
      badgeText: [255, 250, 239],
    },
    phone: CLINIC.phone,
    email: CLINIC.email,
    bookingUrl: BOOKING_URL,
    addressLines: [...CLINIC.addressLines],
    preparedFor: lead?.firstName?.trim() || undefined,
    dateStr,
    verdictLabel: meta.label,
    headline: result.narrative.headline,
    score: result.score,
    narrative: result.narrative.narrative,
    encouragement: result.narrative.encouragement,
    usedPhoto: result.usedPhoto,
    lowerFaceObscured: result.lowerFaceObscured,
    faceImageDataUrl,
    faceImageAspect,
    areas,
    profile: profileEntries(result),
    priceFrom: PRICE_GUIDE.from,
    priceNote: PRICE_GUIDE.note,
    disclaimer: DISCLAIMER,
  });
}

function profileEntries(result: AnalyzeResult): ReportProfileEntry[] {
  const { jowls, neck } = lowerFaceProfile(result);
  return [
    ...(jowls ? [{ label: "Jawline & jowls", ...jowls, fitLabel: FIT_LABEL[jowls.fit] }] : []),
    ...(neck ? [{ label: "Neck & under-chin", ...neck, fitLabel: FIT_LABEL[neck.fit] }] : []),
  ];
}
