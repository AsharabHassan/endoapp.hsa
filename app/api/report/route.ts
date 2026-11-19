import { deliverReportToGhl } from "@/lib/ghl-report";
import { crmConfigured } from "@/lib/crm-api";
import { deliverReportToCrm } from "@/lib/crm-report";
import { requestClinic } from "@/lib/lead-webhook";
import { CLINIC, BOOKING_URL } from "@/lib/constants";
import { isAllowedAppRequest, rateLimited } from "@/lib/request-guard";

export const runtime = "nodejs";

/** One patient gets one report; a few retries are plenty. */
const REPORT_LIMIT = 5;
const REPORT_WINDOW_MS = 10 * 60_000;

/** For the report link in the email's href (the CRM returns an https URL). */
function escapeAttr(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

interface ReportRequest {
  lead?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  suitabilityLabel?: string;
  score?: number;
  pdfBase64?: string;
}

// POST /api/report — generate-side report PDF arrives here as base64; we upload it
// into GoHighLevel, attach it to the contact (note) and email the client a copy.
// Always returns 200 with a status summary so it never blocks the lead flow.
export async function POST(request: Request): Promise<Response> {
  // Only this app's own pages may make the clinic's account email a report;
  // otherwise anyone could POST any address + PDF and use it as a mail relay.
  if (!isAllowedAppRequest(request)) {
    return Response.json(
      { ok: false, skipped: true, error: "forbidden-report-origin" },
      { status: 403 },
    );
  }
  if (rateLimited(request, "report", REPORT_LIMIT, REPORT_WINDOW_MS)) {
    return Response.json(
      { ok: false, skipped: true, error: "rate-limited" },
      { status: 429 },
    );
  }

  let body: ReportRequest;
  try {
    body = (await request.json()) as ReportRequest;
  } catch {
    return Response.json({ ok: false, error: "invalid json" });
  }

  const lead = body.lead;
  if (!lead?.email || !body.pdfBase64) {
    return Response.json({ ok: false, skipped: true });
  }

  const first = (lead.firstName ?? "").trim();
  const last = (lead.lastName ?? "").trim();
  const label = body.suitabilityLabel ?? "";
  const score = Number.isFinite(body.score) ? body.score : undefined;

  const safeName = (first || "client").replace(/[^\w-]/g, "");
  const fileName = `Endomax-Lift-Report-${safeName}.pdf`;
  const subject = `${first || "Your"} Endomax Lift suitability report`;

  // GoHighLevel attaches the PDF; the CRM sends the patient's private link to it.
  const reportEmailHtml = (reportUrl?: string) => `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#1c1a16;line-height:1.6">
      <p>Hi ${first || "there"},</p>
      <p>Thank you for taking the Endomax Lift suitability analysis at
      <strong>${CLINIC.name}</strong>. ${
        reportUrl
          ? `Your personalised report is ready: <a href="${escapeAttr(reportUrl)}" style="color:#b8902a">open your report (PDF)</a>.`
          : "Your personalised report is attached as a PDF."
      }</p>
      <p>It's a guide to help you prepare — your suitability is always confirmed in
      person. When you're ready, book your free, no-pressure consultation and we'll
      talk you through everything.</p>
      <p><a href="${BOOKING_URL}" style="color:#b8902a">Book your free consultation →</a></p>
      <p style="color:#5c5852">— ${CLINIC.name}, ${CLINIC.byline}</p>
    </div>`;

  const noteParts = ["📄 Endomax Lift suitability report"];
  if (label) noteParts.push(`— ${label}`);
  if (score !== undefined) noteParts.push(`(${score}/100)`);
  const noteBody = `${noteParts.join(" ")}: {url}`;

  const delivery = {
    firstName: first,
    lastName: last,
    email: lead.email,
    phone: lead.phone ?? "",
    pdfBase64: body.pdfBase64,
    fileName,
    subject,
    noteBody,
  };
  // The clinic CRM when CRM_API_KEY is set, else GoHighLevel as before.
  const destination = crmConfigured() ? "CRM" : "GHL";
  const clinic = requestClinic(request);
  const result =
    destination === "CRM"
      ? await deliverReportToCrm({
          ...delivery,
          source: `Endomax Lift Suitability Analyzer · ${clinic === "glasgow" ? "Glasgow" : "London"}`,
          emailHtml: reportEmailHtml,
          fileLabel: "Endomax Lift suitability report",
        })
      : await deliverReportToGhl({ ...delivery, emailHtml: reportEmailHtml() });

  // Surface failures in the server log without leaking the PDF.
  if (!result.ok && !result.skipped) {
    console.error(`[api/report] ${destination} delivery failed:`, result.error);
  } else if (result.ok && result.error) {
    console.warn(`[api/report] ${destination} delivery incomplete:`, result.error);
  }
  return Response.json(result);
}
