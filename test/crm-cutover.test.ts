// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clinicForHost, leadWebhookTarget } from "@/lib/lead-webhook";
import { BOOKING_URL, CRM_BOOKING_URL } from "@/lib/constants";
import type { AnalyzeResult, Lead } from "@/lib/types";

const CRM_PAGE =
  "https://app.crm.strategyguys.agency/book/harley-street-aesthetic/free-online-consultation-with-aesthetic-";
const LONDON = "https://crm.example.test/hooks/london";
const GLASGOW = "https://crm.example.test/hooks/glasgow";
const GHL = "https://services.leadconnectorhq.com/hooks/example";

describe("booking destination", () => {
  it("sends every booking link to the CRM booking page", () => {
    expect(CRM_BOOKING_URL).toBe(CRM_PAGE);
    expect(BOOKING_URL).toBe(CRM_PAGE);
  });
});

describe("clinicForHost", () => {
  it.each([
    ["endoapp.glasgow.harleystreetaesthetic.clinic", "glasgow"],
    ["ENDOAPP.GLASGOW.harleystreetaesthetic.clinic:443", "glasgow"],
    ["endoapp.harleystreetaesthetic.clinic", "london"],
    ["endoapp-hsa-dyyl.vercel.app", "london"],
    ["notglasgow.example.com", "london"],
    [null, "london"],
  ])("%s → %s", (host, clinic) => {
    expect(clinicForHost(host)).toBe(clinic);
  });
});

describe("leadWebhookTarget", () => {
  it("uses the clinic's CRM webhook when it is set", () => {
    const env = { GHL_WEBHOOK_URL: GHL, CRM_WEBHOOK_URL_LONDON: LONDON, CRM_WEBHOOK_URL_GLASGOW: GLASGOW };
    expect(leadWebhookTarget("london", env)).toEqual({ url: LONDON, destination: "crm" });
    expect(leadWebhookTarget("glasgow", env)).toEqual({ url: GLASGOW, destination: "crm" });
  });

  it("never sends one clinic's lead to the other clinic's CRM", () => {
    expect(leadWebhookTarget("glasgow", { GHL_WEBHOOK_URL: GHL, CRM_WEBHOOK_URL_LONDON: LONDON }))
      .toEqual({ url: GHL, destination: "ghl" });
    expect(leadWebhookTarget("london", { GHL_WEBHOOK_URL: GHL, CRM_WEBHOOK_URL_GLASGOW: GLASGOW }))
      .toEqual({ url: GHL, destination: "ghl" });
  });

  it("keeps GoHighLevel when no CRM webhook is set, and nothing when neither is", () => {
    expect(leadWebhookTarget("london", { GHL_WEBHOOK_URL: GHL })).toEqual({ url: GHL, destination: "ghl" });
    expect(leadWebhookTarget("london", {})).toBeUndefined();
  });
});

describe("server env", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("treats a blank CRM webhook as not set", async () => {
    vi.stubEnv("CRM_WEBHOOK_URL_LONDON", "  ");
    const { serverEnv } = await import("@/lib/env");
    expect(serverEnv().CRM_WEBHOOK_URL_LONDON).toBeUndefined();
  });

  it("rejects a CRM webhook that is not an https URL", async () => {
    vi.stubEnv("CRM_WEBHOOK_URL_GLASGOW", "http://crm.example.test/hook");
    const { serverEnv } = await import("@/lib/env");
    expect(() => serverEnv()).toThrow(/CRM_WEBHOOK_URL_GLASGOW must use https/);
  });
});

describe("POST /api/lead routing", () => {
  const lead: Lead = {
    firstName: "Jane", lastName: "Doe", email: "jane@example.com", phone: "07700900123", marketingConsent: false,
  };
  const result: AnalyzeResult = {
    bucket: "great", score: 88, hardFlags: [], softFlagged: false, routedReason: "ideal", usedPhoto: true,
    lowerFaceObscured: false, areaEnhancements: {}, framingAdequate: true, narrativeSource: "claude",
    narrative: { headline: "h", narrative: "n", observedAreas: [], encouragement: "e" },
  };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubEnv("GHL_WEBHOOK_URL", GHL);
    fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function post(host: string) {
    const { POST } = await import("@/app/api/lead/route");
    const res = await POST(new Request(`https://${host}/api/lead`, {
      method: "POST",
      headers: { "content-type": "application/json", host },
      body: JSON.stringify({ lead, result }),
    }));
    return (await res.json()) as { ok: boolean; delivered: boolean };
  }

  it("delivers a Glasgow site's lead to the Glasgow CRM webhook, payload unchanged", async () => {
    vi.stubEnv("CRM_WEBHOOK_URL_GLASGOW", GLASGOW);
    const out = await post("endoapp.glasgow.harleystreetaesthetic.clinic");
    expect(out).toEqual({ ok: true, delivered: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(GLASGOW);
    const sent = JSON.parse(String(init.body));
    expect(sent).toMatchObject({ firstName: "Jane", email: "jane@example.com", meta_event_name: "Lead", meta_currency: "GBP" });
    expect(sent.tags).toContain("endomax-analyzer");
  });

  it("delivers a London site's lead to the London CRM webhook", async () => {
    vi.stubEnv("CRM_WEBHOOK_URL_LONDON", LONDON);
    vi.stubEnv("CRM_WEBHOOK_URL_GLASGOW", GLASGOW);
    await post("endoapp.harleystreetaesthetic.clinic");
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([LONDON]);
  });

  it("keeps posting to GoHighLevel while the clinic's CRM webhook is not set", async () => {
    vi.stubEnv("CRM_WEBHOOK_URL_LONDON", LONDON);
    await post("endoapp.glasgow.harleystreetaesthetic.clinic");
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([GHL]);
  });
});
