import type { GhlPayload } from "./ghl";

// ─────────────────────────────────────────────────────────────────────────────
// Where this app's data lands in the clinic CRM (Harley Street Aesthetics
// sub-account). The CRM holds the GoHighLevel custom fields, imported with a
// map from each GHL field id to its CRM key (ghl_import_map, read 19 Nov 2026).
// Keys here are CRM keys. Values sent to a dropdown/multiselect must be one of
// its options, so they are checked against the snapshot below before sending.
// ─────────────────────────────────────────────────────────────────────────────

/** X-Source on every CRM call (shown in the CRM's logs). */
export const CRM_APP_SOURCE = "hsa-endomax-app";

export interface CrmFieldDef {
  label: string;
  type: "text" | "textarea" | "dropdown" | "multiselect";
  options?: readonly string[];
}

/** The CRM contact fields this app writes (snapshot of custom_fields). */
export const CRM_CONTACT_FIELDS = {
  facial_app_report_pdf: { label: "Facial APP Report PDF", type: "text" },
  // "Endo App" folder
  score: { label: "Score", type: "text" },
  assessment_label: { label: "Assessment Label", type: "text" },
  assessment_zones: { label: "Assessment Zones", type: "text" },
  // the fields the other HSA analyzers' GHL workflows filled
  suitability_score: { label: "Suitability Score", type: "text" },
  hsa_pigmentation_summary: { label: "HSA Pigmentation Summary", type: "textarea" },
  hsa_marketing_consent: { label: "HSA Marketing Consent", type: "multiselect", options: ["Yes", "true", "false"] },
  hsa_meta_event_id: { label: "HSA Meta Event ID", type: "text" },
  time_of_form_submission: { label: "Time of Form Submission", type: "text" },
  form_submitted_treatment: { label: "Form Submitted Treatment", type: "text" },
} as const satisfies Record<string, CrmFieldDef>;

export type CrmFieldKey = keyof typeof CRM_CONTACT_FIELDS;

/** The field that holds the report's link (GHL_REPORT_FIELD_KEY on the GHL path). */
export const CRM_REPORT_FIELD_KEY: CrmFieldKey = "facial_app_report_pdf";

/**
 * Every field the GoHighLevel code path writes today, with its GHL id and key
 * and the CRM key it maps to. This app's GHL code writes only the report link
 * (lib/ghl-report.ts); its lead goes to GHL as an inbound webhook, and the GHL
 * workflow behind that webhook was not among the workflows imported into the
 * CRM, so the lead fields below are matched to the CRM's "Endo App" fields and
 * to the fields the other HSA analyzers' workflows filled.
 */
export const GHL_TO_CRM_FIELDS = [
  { ghlId: "yq2y7oeNIBsBsjU2xCzn", ghlKey: "facial_app_report_pdf", crmKey: "facial_app_report_pdf", from: "report link" },
] as const satisfies readonly { ghlId: string; ghlKey: string; crmKey: CrmFieldKey; from: string }[];

/** The lead fields matched to CRM fields (GHL ids from the import map). */
export const LEAD_FIELD_MATCHES = [
  { ghlId: "a530TxxT6OIXkuo8Obs6", crmKey: "score", from: "suitabilityScore" },
  { ghlId: "IFlY1GWor8XNLhVDKV7i", crmKey: "suitability_score", from: "suitabilityScore" },
  { ghlId: "1UkvDrl5uvY4Ek2FrBh9", crmKey: "assessment_label", from: "suitabilityLabel" },
  { ghlId: "SgMOHauwI3H4SIygSWIe", crmKey: "assessment_zones", from: "observedAreas" },
  { ghlId: "MedGXzb8msu37474WKVv", crmKey: "hsa_pigmentation_summary", from: "headline" },
  { ghlId: "Z8BOOTILUbBR3eKy8wfC", crmKey: "hsa_marketing_consent", from: "marketingConsent" },
  { ghlId: "ywZtBA2Qh6JSnocTlT99", crmKey: "hsa_meta_event_id", from: "meta_event_id" },
  { ghlId: "0vjNZHyPtESEK9NqSTTM", crmKey: "time_of_form_submission", from: "submittedAt" },
  { ghlId: "Zt6THdeayODom6lQz2XV", crmKey: "form_submitted_treatment", from: "(the app's name)" },
] as const satisfies readonly { ghlId: string; crmKey: CrmFieldKey; from: string }[];

/**
 * Collected by the app (payload fields) with no CRM field to hold them. They
 * still reach the CRM as tags where noted; no field is created for them.
 */
export const UNMAPPED_PAYLOAD_FIELDS = [
  "suitabilityBucket (tag endomax-<bucket>)",
  "hardFlags",
  "usedPhoto",
  "narrativeSource",
  "clinic, from the site's address (tag hsa-clinic-<city> on the CRM path)",
  "consultationContactConsent / At / Statement / Version (tag hsa-consultation-call-requested)",
  "preferredCallTime (tag hsa-call-<time>)",
  "other Meta CAPI fields (pixel id, event time, source URL)",
] as const;

const MAX_TEXT = 5_000;

/** Drop empty values and values a dropdown/multiselect would refuse. */
export function cleanCrmCustom(values: Partial<Record<CrmFieldKey, string | undefined>>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(values)) {
    const field = (CRM_CONTACT_FIELDS as Record<string, CrmFieldDef>)[key];
    const value = (raw ?? "").trim();
    if (!field || !value) continue;
    if (field.options) {
      const picked = value.split(/\s*[,;]\s*/).filter(Boolean);
      const ok = picked.every((p) => field.options!.some((o) => o.toLowerCase() === p.toLowerCase()));
      if (!ok) continue;
    }
    out[key] = value.slice(0, MAX_TEXT);
  }
  return out;
}

/** The lead's answers and results as CRM custom fields. */
export function crmLeadCustomFields(payload: GhlPayload, extra: { metaEventId?: string } = {}): Record<string, string> {
  return cleanCrmCustom({
    score: String(payload.suitabilityScore),
    suitability_score: String(payload.suitabilityScore),
    assessment_label: payload.suitabilityLabel,
    assessment_zones: payload.observedAreas.join(", "),
    hsa_pigmentation_summary: payload.headline,
    hsa_marketing_consent: payload.marketingConsent ? "true" : "false",
    hsa_meta_event_id: extra.metaEventId,
    time_of_form_submission: payload.submittedAt,
    form_submitted_treatment: "Endomax Lift Suitability Analysis",
  });
}
