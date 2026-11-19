import type { LeadRequest } from "@/lib/types";
import { buildGhlPayload } from "@/lib/ghl";
import { serverEnv } from "@/lib/env";
import { after } from "next/server";
import { createHash } from "node:crypto";
import { normalizePhone, sendWebsiteLead } from "@/lib/meta-conversions";
import { readConsultationRequest } from "@/lib/consultation-consent";
import { leadWebhookTarget, requestClinic, type LeadWebhookTarget } from "@/lib/lead-webhook";
import { crmConfigured } from "@/lib/crm-api";
import { crmLeadCustomFields } from "@/lib/crm-fields";
import { ensureLeadInCrm, type CrmLeadResult } from "@/lib/crm-lead";
import { isAllowedAppRequest, rateLimited } from "@/lib/request-guard";

export const runtime = "nodejs";

const RETRIES = 3;
/** Per client address; generous for a household sharing one connection. */
const LEAD_LIMIT = 10;
const LEAD_WINDOW_MS = 10 * 60_000;

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

// POST /api/lead — forward the qualified lead to the clinic's CRM (or to
// GoHighLevel while the CRM webhook is not set). Never blocks the
// user: delivery failures are logged server-side, and we still return 200 so the
// result screen unlocks regardless.
export async function POST(request: Request): Promise<Response> {
  // Only this app's own pages may create a contact in the clinic's CRM.
  if (!isAllowedAppRequest(request)) {
    return Response.json({ ok: false, error: "forbidden-lead-origin" }, { status: 403 });
  }
  if (rateLimited(request, "lead", LEAD_LIMIT, LEAD_WINDOW_MS)) {
    return Response.json({ ok: false, error: "rate-limited" }, { status: 429 });
  }

  let body: LeadRequest;
  try {
    body = (await request.json()) as LeadRequest;
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  if (!body?.lead || !body?.result) {
    return Response.json({ ok: false, error: "missing fields" }, { status: 400 });
  }

  const submittedAt = new Date().toISOString();
  const payload = { ...buildGhlPayload(
    body.lead,
    body.result,
    submittedAt,
    // "I'm requesting a free consultation" — ticked before the scan.
    readConsultationRequest(body as unknown as Record<string, unknown>, submittedAt),
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

  // The clinic's CRM webhook when set (London or Glasgow, from the site's
  // address), else GoHighLevel as before. Same payload either way.
  const clinic = requestClinic(request);
  let target: LeadWebhookTarget | undefined;
  try {
    target = leadWebhookTarget(clinic, serverEnv());
  } catch {
    target = undefined;
  }

  // The clinic CRM's API (CRM_API_KEY): the contact with its tags (plus the
  // site's clinic) and its answers in custom fields, alongside the webhook.
  const crmPromise: Promise<CrmLeadResult | null> = crmConfigured()
    ? ensureLeadInCrm({
        lead: body.lead,
        source: `${payload.source} · ${clinic === "glasgow" ? "Glasgow" : "London"}`,
        tags: [...payload.tags, `hsa-clinic-${clinic}`],
        custom: crmLeadCustomFields(payload, { metaEventId: payload.meta_event_id }),
      })
    : Promise.resolve(null);

  let delivered = false;
  if (target) {
    delivered = await deliver(target.url, payload);
    if (!delivered) console.error(`[lead] ${target.destination.toUpperCase()} delivery failed`, { clinic });
  } else {
    console.warn("[lead] no lead webhook set (CRM_WEBHOOK_URL_LONDON / CRM_WEBHOOK_URL_GLASGOW / GHL_WEBHOOK_URL); lead not forwarded", { clinic });
  }
  const crm = await crmPromise;
  if (crm && !crm.ok) console.error("[lead] CRM contact failed", { clinic, error: crm.error });
  else if (crm?.error) console.warn("[lead] CRM contact incomplete", { clinic, error: crm.error });

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
  return Response.json(crm ? { ok: true, delivered, routingEnsured: crm.ok && crm.tagged === true } : { ok: true, delivered });
}
