import { describe, it, expect } from "vitest";
import { buildGhlPayload } from "@/lib/ghl";
import type { AnalyzeResult, Lead } from "@/lib/types";

const lead: Lead = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "07700900123",
  marketingConsent: true,
};

const result: AnalyzeResult = {
  bucket: "great",
  score: 88,
  hardFlags: [],
  softFlagged: false,
  routedReason: "ideal",
  usedPhoto: true,
  lowerFaceObscured: false,
  areaEnhancements: {},
  framingAdequate: true,
  narrativeSource: "claude",
  narrative: {
    headline: "The Endomax Lift looks like a strong fit",
    narrative: "…",
    observedAreas: ["jawline", "under-chin"],
    encouragement: "…",
  },
};

describe("buildGhlPayload", () => {
  it("records the consultation call request as evidence and tags the contact", () => {
    const p = buildGhlPayload(lead, result, "2026-06-04T10:00:00.000Z", {
      consultationContact: {
        at: "2026-06-04T09:50:00.000Z",
        statement: "I’m requesting a free consultation. Please call, text or WhatsApp me…",
        version: "consultation-contact-v1",
      },
      preferredCallTime: "evening",
    });
    expect(p).toMatchObject({
      consultationContactConsent: true,
      consultationContactConsentAt: "2026-06-04T09:50:00.000Z",
      consultationContactConsentVersion: "consultation-contact-v1",
      preferredCallTime: "evening",
    });
    expect(p.tags).toEqual(
      expect.arrayContaining(["hsa-consultation-call-requested", "hsa-call-evening"]),
    );
    // Kept apart from marketing consent: the call request never implies it.
    expect(buildGhlPayload({ ...lead, marketingConsent: false }, result, "t", {
      consultationContact: { at: "t", statement: "s", version: "v" },
    }).marketingConsent).toBe(false);
    const without = buildGhlPayload(lead, result, "t");
    expect(without.consultationContactConsent).toBe(false);
    expect(without.tags).not.toContain("hsa-consultation-call-requested");
  });

  it("maps contact fields", () => {
    const p = buildGhlPayload(lead, result, "2026-06-04T10:00:00.000Z");
    expect(p.firstName).toBe("Jane");
    expect(p.lastName).toBe("Doe");
    expect(p.name).toBe("Jane Doe");
    expect(p.email).toBe("jane@example.com");
    expect(p.phone).toBe("07700900123");
  });

  it("tags the lead with the bucket for AI-agent routing", () => {
    const p = buildGhlPayload(lead, result, "2026-06-04T10:00:00.000Z");
    expect(p.tags).toContain("endomax-analyzer");
    expect(p.tags).toContain("endomax-great");
  });

  it("carries the suitability fields", () => {
    const p = buildGhlPayload(lead, result, "2026-06-04T10:00:00.000Z");
    expect(p.suitabilityBucket).toBe("great");
    expect(p.suitabilityScore).toBe(88);
    expect(p.suitabilityLabel).toBe("Strong candidate");
    expect(p.usedPhoto).toBe(true);
    expect(p.observedAreas).toEqual(["jawline", "under-chin"]);
    expect(p.submittedAt).toBe("2026-06-04T10:00:00.000Z");
  });

  it("records marketing consent as its own boolean, separate from the lead", () => {
    const granted = buildGhlPayload(lead, result, "t");
    expect(granted.marketingConsent).toBe(true);

    const declined = buildGhlPayload(
      { ...lead, marketingConsent: false },
      result,
      "t",
    );
    expect(declined.marketingConsent).toBe(false);
  });

  it("serializes hard flags for consultation-routed leads", () => {
    const p = buildGhlPayload(lead, {
      ...result,
      bucket: "consultation",
      hardFlags: ["pregnancy"],
    });
    expect(p.suitabilityBucket).toBe("consultation");
    expect(p.hardFlags).toContain("pregnancy");
    expect(p.tags).toContain("endomax-consultation");
  });
});
