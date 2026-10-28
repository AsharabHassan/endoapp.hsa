import type { AnalyzeResult, Lead } from "./types";
import { BUCKET_META } from "./constants";
import type { ConsultationContact } from "./consultation-consent";

// ─────────────────────────────────────────────────────────────────────────────
// Pure builder for the GoHighLevel inbound-webhook payload. No network here —
// the route owns delivery/retry. Marketing consent is carried as its own field,
// deliberately separate from the lead's intent to see their result (PECR).
// ─────────────────────────────────────────────────────────────────────────────

export interface GhlPayload {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  tags: string[];
  suitabilityBucket: string;
  suitabilityLabel: string;
  suitabilityScore: number;
  hardFlags: string[];
  observedAreas: string[];
  usedPhoto: boolean;
  narrativeSource: string;
  headline: string;
  marketingConsent: boolean;
  /** The client asked us to call/text/WhatsApp them about their consultation. */
  consultationContactConsent: boolean;
  consultationContactConsentAt?: string;
  consultationContactStatement?: string;
  consultationContactConsentVersion?: string;
  preferredCallTime?: string;
  submittedAt?: string;
}

export interface ConsultationOptions {
  consultationContact?: ConsultationContact;
  preferredCallTime?: string;
}

export function buildGhlPayload(
  lead: Lead,
  result: AnalyzeResult,
  submittedAt?: string,
  consultation: ConsultationOptions = {},
): GhlPayload {
  const { consultationContact, preferredCallTime } = consultation;
  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    name: `${lead.firstName} ${lead.lastName}`.trim(),
    email: lead.email,
    phone: lead.phone,
    source: "Endomax Lift Suitability Analyzer",
    tags: [
      "endomax-analyzer",
      `endomax-${result.bucket}`,
      ...(consultationContact ? ["hsa-consultation-call-requested"] : []),
      ...(preferredCallTime ? [`hsa-call-${preferredCallTime}`] : []),
    ],
    suitabilityBucket: result.bucket,
    suitabilityLabel: BUCKET_META[result.bucket].label,
    suitabilityScore: result.score,
    hardFlags: result.hardFlags,
    observedAreas: result.narrative.observedAreas,
    usedPhoto: result.usedPhoto,
    narrativeSource: result.narrativeSource,
    headline: result.narrative.headline,
    marketingConsent: lead.marketingConsent,
    consultationContactConsent: Boolean(consultationContact),
    consultationContactConsentAt: consultationContact?.at,
    consultationContactStatement: consultationContact?.statement,
    consultationContactConsentVersion: consultationContact?.version,
    preferredCallTime,
    submittedAt,
  };
}
