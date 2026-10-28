import { CLINIC } from "./constants";

// ─────────────────────────────────────────────────────────────────────────────
// The scan is a request for a free consultation, not a free AI toy. Before the
// (paid) analysis runs, the client ticks an explicit, unticked-by-default box
// asking our team to call / text / WhatsApp them about their guide and their
// consultation. That contact is the service they are requesting — it is NOT
// marketing consent, which stays separate (the optional box on the lead gate)
// and is never bundled with this. The exact wording + version are stored on
// the CRM contact as evidence.
// ─────────────────────────────────────────────────────────────────────────────

export const CONSULTATION_CONTACT_CONSENT_VERSION = "consultation-contact-v1";

/** How quickly the clinic promises the first call (shown to the client). */
export const CALLBACK_PROMISE = "within 1 working day";

export const CONSENT_HEADLINE = "I’m requesting a free consultation.";

export const CONSENT_DETAIL =
  "Please call, text or WhatsApp me about my guide and to arrange my " +
  "consultation with Dr Ayda.";

/** The exact statement the client agrees to (also sent to the CRM). */
export const CONSULTATION_CONTACT_STATEMENT = `${CONSENT_HEADLINE} ${CONSENT_DETAIL}`;

export const CALL_TIMES = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
] as const;

export type CallTimeKey = (typeof CALL_TIMES)[number]["key"];
export const CALL_TIME_KEYS = CALL_TIMES.map((t) => t.key) as [
  CallTimeKey,
  ...CallTimeKey[],
];

/** The call request as recorded on the CRM contact. */
export interface ConsultationContact {
  at: string;
  statement: string;
  version: string;
}

/**
 * Read the call request from an untrusted /api/lead body. Optional so a tab
 * opened before this release doesn't lose its lead; anything malformed is
 * dropped rather than forwarded to the CRM.
 */
export function readConsultationRequest(
  body: Record<string, unknown>,
  submittedAt: string,
): { consultationContact?: ConsultationContact; preferredCallTime?: CallTimeKey } {
  const text = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";
  const at = text(body.consultationContactConsentAt, 40);
  const consultationContact =
    body.consultationContactConsent === true
      ? {
          at: at && !Number.isNaN(Date.parse(at)) ? at : submittedAt,
          statement: text(body.consultationContactStatement, 500),
          version: text(body.consultationContactConsentVersion, 64),
        }
      : undefined;
  const preferredCallTime = CALL_TIME_KEYS.find((k) => k === body.preferredCallTime);
  return { consultationContact, preferredCallTime };
}

/** A downloadable contact card so our call doesn't arrive as an unknown number. */
export function clinicVCard(): string {
  const tel = CLINIC.phoneHref.replace(/^tel:/, "");
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${CLINIC.name}`,
    `ORG:${CLINIC.name}`,
    `TEL;TYPE=WORK,VOICE:${tel}`,
    "END:VCARD",
  ].join("\r\n");
}
