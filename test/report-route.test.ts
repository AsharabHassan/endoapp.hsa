// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { deliverReportToGhl, deliverReportToCrm } = vi.hoisted(() => ({
  deliverReportToGhl: vi.fn(),
  deliverReportToCrm: vi.fn(),
}));
vi.mock("@/lib/ghl-report", () => ({ deliverReportToGhl }));
vi.mock("@/lib/crm-report", () => ({ deliverReportToCrm }));

import { POST } from "@/app/api/report/route";

const PDF_BASE64 = Buffer.from("%PDF-1.4\nreport bytes\n").toString("base64");
const CRM_PAGE =
  "https://app.harleystreetaesthetic.co.uk/book/harley-street-aesthetic/free-online-consultation-with-aesthetic-";

function reportRequest(host = "endoapp.harleystreetaesthetic.clinic"): Request {
  return new Request(`https://${host}/api/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json", host, origin: `https://${host}` },
    body: JSON.stringify({
      lead: { firstName: "Jane", lastName: "Doe", email: "jane@example.com", phone: "07700900123" },
      suitabilityLabel: "Strong candidate",
      score: 88,
      pdfBase64: PDF_BASE64,
    }),
  });
}

beforeEach(() => {
  delete process.env.CRM_API_KEY;
  deliverReportToGhl.mockReset();
  deliverReportToGhl.mockResolvedValue({ ok: true, emailed: true, noted: true });
  deliverReportToCrm.mockReset();
  deliverReportToCrm.mockResolvedValue({ ok: true, emailed: true, noted: true });
});
afterEach(() => {
  delete process.env.CRM_API_KEY;
  delete process.env.GHL_API_TOKEN;
  delete process.env.GHL_LOCATION_ID;
  vi.restoreAllMocks();
});

describe("POST /api/report", () => {
  it("uses the CRM, not GoHighLevel, when CRM_API_KEY is set", async () => {
    process.env.CRM_API_KEY = "crm-test-key";
    process.env.GHL_API_TOKEN = "ghl-token";
    process.env.GHL_LOCATION_ID = "ghl-location";
    const response = await POST(reportRequest("endoapp.glasgow.harleystreetaesthetic.clinic"));
    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(deliverReportToGhl).not.toHaveBeenCalled();
    expect(deliverReportToCrm).toHaveBeenCalledTimes(1);

    const input = deliverReportToCrm.mock.calls[0][0];
    expect(input).toMatchObject({
      email: "jane@example.com",
      fileName: "Endomax-Lift-Report-Jane.pdf",
      subject: "Jane Endomax Lift suitability report",
      fileLabel: "Endomax Lift suitability report",
      source: "Endomax Lift Suitability Analyzer · Glasgow",
    });
    // Same email as GoHighLevel's, with the CRM's private link instead of an attachment.
    const link = "https://app.harleystreetaesthetic.co.uk/file/7/abc";
    const html: string = input.emailHtml(link);
    expect(html).toContain(`href="${link}"`);
    expect(html).toContain("Hi Jane");
    expect(html).toContain("Book your free consultation");
    expect(html).toContain(`href="${CRM_PAGE}"`);
    expect(html).not.toContain("attached as a PDF");
    expect(html).not.toContain("{{");
    expect(input.noteBody).toBe("📄 Endomax Lift suitability report — Strong candidate (88/100): {url}");
  });

  it("keeps GoHighLevel when only the GHL env is set", async () => {
    process.env.GHL_API_TOKEN = "ghl-token";
    process.env.GHL_LOCATION_ID = "ghl-location";
    await POST(reportRequest());
    expect(deliverReportToCrm).not.toHaveBeenCalled();
    expect(deliverReportToGhl).toHaveBeenCalledTimes(1);
    const input = deliverReportToGhl.mock.calls[0][0];
    expect(input.emailHtml).toContain("attached as a PDF");
    expect(input).toMatchObject({ fileName: "Endomax-Lift-Report-Jane.pdf", email: "jane@example.com" });
  });

  it("still answers 200 when the CRM delivery fails", async () => {
    process.env.CRM_API_KEY = "crm-test-key";
    vi.spyOn(console, "error").mockImplementation(() => {});
    deliverReportToCrm.mockResolvedValue({ ok: false, error: "contact-upsert 503" });
    const response = await POST(reportRequest());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: false });
  });
});
