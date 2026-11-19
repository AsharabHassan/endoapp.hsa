import { describe, expect, it } from "vitest";

import {
  CRM_CONTACT_FIELDS,
  CRM_REPORT_FIELD_KEY,
  GHL_TO_CRM_FIELDS,
  LEAD_FIELD_MATCHES,
  cleanCrmCustom,
  crmLeadCustomFields,
} from "@/lib/crm-fields";
import { buildGhlPayload } from "@/lib/ghl";
import type { AnalyzeResult, Lead } from "@/lib/types";

const lead: Lead = { firstName: "Jane", lastName: "Doe", email: "jane@example.com", phone: "07700900123", marketingConsent: false };
const result: AnalyzeResult = {
  bucket: "consultation", score: 52, hardFlags: ["pregnancy"], softFlagged: false, routedReason: "r", usedPhoto: false,
  lowerFaceObscured: false, areaEnhancements: {}, framingAdequate: true, narrativeSource: "fallback",
  narrative: { headline: "Let's talk it through", narrative: "n", observedAreas: [], encouragement: "e" },
};
const payload = buildGhlPayload(lead, result, "2026-11-19T10:00:00.000Z");

describe("GoHighLevel → CRM field map", () => {
  it("gives every field the GHL path writes a CRM key that exists in the CRM", () => {
    for (const f of GHL_TO_CRM_FIELDS) {
      expect(CRM_CONTACT_FIELDS, `${f.ghlKey} (${f.ghlId})`).toHaveProperty(f.crmKey);
    }
    // ghl-report.ts writes GHL_REPORT_FIELD_KEY (default facial_app_report_pdf)
    expect(GHL_TO_CRM_FIELDS.find((f) => f.ghlKey === "facial_app_report_pdf")?.crmKey).toBe(CRM_REPORT_FIELD_KEY);
    for (const m of LEAD_FIELD_MATCHES) expect(CRM_CONTACT_FIELDS, m.from).toHaveProperty(m.crmKey);
  });

  it("only writes CRM keys that exist, with values their field accepts", () => {
    const custom = crmLeadCustomFields(payload, { metaEventId: "evt-9" });
    expect(Object.keys(custom).sort()).toEqual(
      ["score", "suitability_score", "assessment_label", "hsa_pigmentation_summary", "hsa_marketing_consent", "hsa_meta_event_id", "time_of_form_submission", "form_submitted_treatment"].sort(),
    );
    for (const [key, value] of Object.entries(custom)) {
      const field = (CRM_CONTACT_FIELDS as Record<string, { options?: readonly string[] }>)[key];
      expect(field, key).toBeDefined();
      if (field.options) expect(field.options).toContain(value);
      expect(value).not.toContain("{{");
    }
    expect(custom).toMatchObject({ score: "52", assessment_label: "Consultation recommended", hsa_marketing_consent: "false" });
  });

  it("drops empty values (they would clear the field) and options the CRM would refuse", () => {
    expect(cleanCrmCustom({ assessment_zones: "", hsa_marketing_consent: "maybe", score: " 7 " })).toEqual({ score: "7" });
  });
});
