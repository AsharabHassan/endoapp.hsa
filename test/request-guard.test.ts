// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { deliverReportToGhl, deliverReportToCrm, ensureLeadInCrm } = vi.hoisted(() => ({
  deliverReportToGhl: vi.fn(),
  deliverReportToCrm: vi.fn(),
  ensureLeadInCrm: vi.fn(),
}));
vi.mock("@/lib/ghl-report", () => ({ deliverReportToGhl }));
vi.mock("@/lib/crm-report", () => ({ deliverReportToCrm }));
vi.mock("@/lib/crm-lead", () => ({ ensureLeadInCrm }));
vi.mock("next/server", () => ({ after: () => {} }));

import { POST as reportPOST } from "@/app/api/report/route";
import { POST as leadPOST } from "@/app/api/lead/route";
import {
  isAllowedAppOrigin,
  isAllowedAppRequest,
  rateLimited,
  resetRateLimits,
} from "@/lib/request-guard";

const PDF_BASE64 = Buffer.from("%PDF-1.4\nreport bytes\n").toString("base64");
const LIVE_LONDON = "https://endoapp.harleystreetaesthetic.clinic";

const ALLOWED = [
  LIVE_LONDON,
  "https://endoapp.glasgow.harleystreetaesthetic.clinic",
  "https://endoapp-hsa.vercel.app",
  "https://endoapp-hsa-dyyl.vercel.app",
  "http://localhost:3000",
  "http://localhost",
  "http://127.0.0.1:3000",
];
const FORBIDDEN = [
  "https://evil.example",
  "https://endoapp.harleystreetaesthetic.clinic.evil.example",
  "https://evil-endoapp-hsa.vercel.app",
  "http://endoapp.harleystreetaesthetic.clinic",
  "https://localhost:3000",
  "http://localhost.evil.example",
  "null",
];

function post(
  path: "report" | "lead",
  headers: Record<string, string>,
  body: unknown,
): Request {
  return new Request(`${LIVE_LONDON}/api/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const reportBody = {
  lead: { firstName: "Jane", lastName: "Doe", email: "victim@example.com", phone: "07700900123" },
  suitabilityLabel: "Strong candidate",
  score: 88,
  pdfBase64: PDF_BASE64,
};
const leadBody = {
  lead: { firstName: "Jane", lastName: "Doe", email: "jane@example.com", phone: "07700900123", marketingConsent: false },
  result: {
    bucket: "great", score: 88, hardFlags: [], softFlagged: false, routedReason: "ideal", usedPhoto: true,
    lowerFaceObscured: false, areaEnhancements: {}, framingAdequate: true, narrativeSource: "claude",
    narrative: { headline: "h", narrative: "n", observedAreas: [], encouragement: "e" },
  },
};

beforeEach(() => {
  resetRateLimits();
  deliverReportToGhl.mockReset();
  deliverReportToGhl.mockResolvedValue({ ok: true, emailed: true, noted: true });
  deliverReportToCrm.mockReset();
  deliverReportToCrm.mockResolvedValue({ ok: true, emailed: true, noted: true });
  ensureLeadInCrm.mockReset();
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  vi.stubEnv("GHL_WEBHOOK_URL", "https://services.example.test/hook");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("isAllowedAppOrigin", () => {
  it.each(ALLOWED)("allows %s", (origin) => {
    expect(isAllowedAppOrigin(origin)).toBe(true);
  });
  it("ignores case and surrounding space", () => {
    expect(isAllowedAppOrigin("  HTTPS://ENDOAPP.HARLEYSTREETAESTHETIC.CLINIC ")).toBe(true);
  });
  it.each(FORBIDDEN)("forbids %s", (origin) => {
    expect(isAllowedAppOrigin(origin)).toBe(false);
  });
  it("forbids a missing origin", () => {
    expect(isAllowedAppOrigin(null)).toBe(false);
    expect(isAllowedAppOrigin("")).toBe(false);
  });
});

describe("isAllowedAppRequest", () => {
  it("rejects a cross-site fetch even with an allowed origin", () => {
    expect(isAllowedAppRequest(post("report", { origin: LIVE_LONDON, "sec-fetch-site": "cross-site" }, {}))).toBe(false);
    expect(isAllowedAppRequest(post("report", { origin: LIVE_LONDON, "sec-fetch-site": "same-site" }, {}))).toBe(false);
  });
  it("accepts a same-origin fetch from an allowed origin", () => {
    expect(isAllowedAppRequest(post("report", { origin: LIVE_LONDON, "sec-fetch-site": "same-origin" }, {}))).toBe(true);
  });
});

describe("POST /api/report origin guard", () => {
  it.each(ALLOWED)("sends the report for %s", async (origin) => {
    const response = await reportPOST(post("report", { origin }, reportBody));
    expect(response.status).toBe(200);
    expect(deliverReportToGhl).toHaveBeenCalledTimes(1);
  });

  it.each(FORBIDDEN)("refuses %s with 403 and emails nobody", async (origin) => {
    const response = await reportPOST(post("report", { origin }, reportBody));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, skipped: true, error: "forbidden-report-origin" });
    expect(deliverReportToGhl).not.toHaveBeenCalled();
    expect(deliverReportToCrm).not.toHaveBeenCalled();
  });

  it("refuses a request with no Origin header", async () => {
    const response = await reportPOST(post("report", {}, reportBody));
    expect(response.status).toBe(403);
    expect(deliverReportToGhl).not.toHaveBeenCalled();
  });

  it("rate-limits one address after 5 reports in 10 minutes", async () => {
    const headers = { origin: LIVE_LONDON, "x-forwarded-for": "203.0.113.7" };
    for (let i = 0; i < 5; i++) {
      expect((await reportPOST(post("report", headers, reportBody))).status).toBe(200);
    }
    const blocked = await reportPOST(post("report", headers, reportBody));
    expect(blocked.status).toBe(429);
    expect(deliverReportToGhl).toHaveBeenCalledTimes(5);
    // Another address is unaffected.
    const other = await reportPOST(post("report", { origin: LIVE_LONDON, "x-forwarded-for": "203.0.113.8" }, reportBody));
    expect(other.status).toBe(200);
  });
});

describe("POST /api/lead origin guard", () => {
  it.each(ALLOWED)("accepts the lead for %s", async (origin) => {
    const response = await leadPOST(post("lead", { origin }, leadBody));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, delivered: true });
  });

  it.each(FORBIDDEN)("refuses %s with 403 and forwards nothing", async (origin) => {
    const response = await leadPOST(post("lead", { origin }, leadBody));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "forbidden-lead-origin" });
    expect(fetch).not.toHaveBeenCalled();
    expect(ensureLeadInCrm).not.toHaveBeenCalled();
  });

  it("refuses a request with no Origin header", async () => {
    const response = await leadPOST(post("lead", {}, leadBody));
    expect(response.status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rate-limits one address after 10 leads in 10 minutes", async () => {
    const headers = { origin: LIVE_LONDON, "x-forwarded-for": "198.51.100.4" };
    for (let i = 0; i < 10; i++) {
      expect((await leadPOST(post("lead", headers, leadBody))).status).toBe(200);
    }
    expect((await leadPOST(post("lead", headers, leadBody))).status).toBe(429);
  });
});

describe("rateLimited", () => {
  const request = (ip?: string) =>
    new Request(`${LIVE_LONDON}/api/lead`, { method: "POST", headers: ip ? { "x-forwarded-for": ip } : {} });

  it("opens a new window once the old one expires", () => {
    const now = 1_000_000;
    expect(rateLimited(request("192.0.2.1"), "t", 1, 1_000, now)).toBe(false);
    expect(rateLimited(request("192.0.2.1"), "t", 1, 1_000, now + 10)).toBe(true);
    expect(rateLimited(request("192.0.2.1"), "t", 1, 1_000, now + 1_000)).toBe(false);
  });

  it("does not limit requests with no identifiable address", () => {
    for (let i = 0; i < 5; i++) expect(rateLimited(request(), "t", 1, 1_000)).toBe(false);
    expect(rateLimited(request("not-an-ip"), "t", 1, 1_000)).toBe(false);
    expect(rateLimited(request("not-an-ip"), "t", 1, 1_000)).toBe(false);
  });

  it("counts endpoints separately", () => {
    expect(rateLimited(request("192.0.2.9"), "a", 1, 1_000)).toBe(false);
    expect(rateLimited(request("192.0.2.9"), "b", 1, 1_000)).toBe(false);
  });
});
