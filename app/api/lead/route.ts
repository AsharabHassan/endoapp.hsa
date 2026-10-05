import type { LeadRequest } from "@/lib/types";
import { buildGhlPayload } from "@/lib/ghl";
import { serverEnv } from "@/lib/env";
import { after } from "next/server";
import { createHash } from "node:crypto";
import { normalizePhone, sendWebsiteLead } from "@/lib/meta-conversions";

export const runtime = "nodejs";

const RETRIES = 3;

async function deliver(url: string, payload: unknown): Promise<boolean> {
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return true;
    } catch {
      /* network error — retry */
    }
    // simple linear backoff: 250ms, 500ms
    await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
  }
  return false;
}

// POST /api/lead — forward the qualified lead to GoHighLevel. Never blocks the
// user: delivery failures are logged server-side, and we still return 200 so the
// result screen unlocks regardless.
export async function POST(request: Request): Promise<Response> {
  let body: LeadRequest;
  try {
    body = (await request.json()) as LeadRequest;
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  if (!body?.lead || !body?.result) {
    return Response.json({ ok: false, error: "missing fields" }, { status: 400 });
  }

  const payload = { ...buildGhlPayload(
    body.lead,
    body.result,
    new Date().toISOString(),
  ),
    meta_pixel_id: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    meta_event_name: "Lead",
    meta_event_id: typeof body.metaEventId === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(body.metaEventId)
      ? body.metaEventId : "",
    meta_currency: "GBP",
    meta_action_source: "website",
    meta_event_time: Math.floor(Date.now() / 1000),
    meta_event_source_url: "https://endoapp.harleystreetaesthetic.clinic/",
  };

  let webhook: string | undefined;
  try {
    webhook = serverEnv().GHL_WEBHOOK_URL;
  } catch {
    webhook = undefined;
  }

  let delivered = false;
  if (webhook) {
    delivered = await deliver(webhook, payload);
    if (!delivered) console.error("[lead] GHL delivery failed");
  } else {
    console.warn("[lead] GHL_WEBHOOK_URL not set; lead not forwarded");
  }

  if (delivered && payload.meta_event_id) {
    const hash = (value: unknown) => typeof value === "string" && value.trim()
      ? createHash("sha256").update(value.trim().toLowerCase()).digest("hex") : "";
    const cookie = (name: string) => request.headers.get("cookie")?.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1] || "";
    const event = {
      eventId: payload.meta_event_id,
      eventTime: payload.meta_event_time,
      emailHash: hash(body.lead.email),
      phoneHash: hash(typeof body.lead.phone === "string" ? normalizePhone(body.lead.phone) : ""),
      firstNameHash: hash(body.lead.firstName),
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
      userAgent: request.headers.get("user-agent") || "",
      fbp: cookie("_fbp"), fbc: cookie("_fbc"),
    };
    after(async () => { await sendWebsiteLead(event); });
  }
  return Response.json({ ok: true, delivered });
}
