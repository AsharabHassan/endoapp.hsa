// ─────────────────────────────────────────────────────────────────────────────
// Where a lead is delivered: the clinic's own CRM, or GoHighLevel until then.
//
// This app is deployed once per city (two Vercel projects, same code):
//   endoapp.harleystreetaesthetic.clinic          → London
//   endoapp.glasgow.harleystreetaesthetic.clinic  → Glasgow
// so the clinic is read from the site's address, not from the patient.
// ─────────────────────────────────────────────────────────────────────────────

export type LeadClinic = "london" | "glasgow";

export interface LeadWebhookEnv {
  GHL_WEBHOOK_URL?: string;
  CRM_WEBHOOK_URL_LONDON?: string;
  CRM_WEBHOOK_URL_GLASGOW?: string;
}

export interface LeadWebhookTarget {
  url: string;
  destination: "crm" | "ghl";
}

/** Glasgow when the site's host name has a "glasgow" label; London otherwise. */
export function clinicForHost(host: string | null | undefined): LeadClinic {
  const name = (host ?? "").trim().toLowerCase().split(":")[0];
  return name.split(".").includes("glasgow") ? "glasgow" : "london";
}

/** The site's host as the visitor typed it (Vercel sets x-forwarded-host). */
export function requestClinic(request: Request): LeadClinic {
  let urlHost: string | null = null;
  try {
    urlHost = new URL(request.url).host;
  } catch {
    urlHost = null;
  }
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0] ||
    request.headers.get("host") ||
    urlHost;
  return clinicForHost(host);
}

/**
 * The clinic's CRM webhook when it is set; otherwise GoHighLevel, exactly as
 * before the cutover; undefined when neither is configured.
 */
export function leadWebhookTarget(
  clinic: LeadClinic,
  env: LeadWebhookEnv,
): LeadWebhookTarget | undefined {
  const crm =
    clinic === "glasgow" ? env.CRM_WEBHOOK_URL_GLASGOW : env.CRM_WEBHOOK_URL_LONDON;
  if (crm) return { url: crm, destination: "crm" };
  if (env.GHL_WEBHOOK_URL) return { url: env.GHL_WEBHOOK_URL, destination: "ghl" };
  return undefined;
}
