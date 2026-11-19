import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Server-only environment access. Validated lazily so the bundle never leaks
// secrets to the client and missing config fails fast at request time, with a
// clear message, rather than as a cryptic SDK error.
// ─────────────────────────────────────────────────────────────────────────────

/** Optional https URL; a blank value (placeholder) counts as not set. */
function crmWebhookUrl(name: string) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z
      .string()
      .trim()
      .url(`${name} must be a valid URL`)
      .refine((value) => value.startsWith("https://"), `${name} must use https`)
      .optional(),
  );
}

const serverSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  ANTHROPIC_MODEL: z.string().min(1).default("claude-sonnet-5-5"),
  GHL_WEBHOOK_URL: z
    .string()
    .url("GHL_WEBHOOK_URL must be a valid URL")
    .optional(),
  // The clinic CRM's inbound lead webhook, one per clinic. When the one for
  // this site's clinic is set, leads go there instead of GHL_WEBHOOK_URL.
  CRM_WEBHOOK_URL_LONDON: crmWebhookUrl("CRM_WEBHOOK_URL_LONDON"),
  CRM_WEBHOOK_URL_GLASGOW: crmWebhookUrl("CRM_WEBHOOK_URL_GLASGOW"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

/** Validate and return server env. Throws if required vars are missing. */
export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => i.message).join("; ");
    throw new Error(`Invalid server environment: ${issues}`);
  }
  cached = parsed.data;
  return cached;
}
