import { describe, expect, it } from "vitest";
import { buildReportPdf, type ReportInput } from "@/lib/report-pdf";

const sample: ReportInput = {
  clinicName: "Harley Street Aesthetics", treatmentName: "Endomax Lift", byline: "London · Glasgow",
  palette: { bg: [248, 244, 236], panel: [238, 228, 209], gold: [165, 126, 55], goldLt: [186, 145, 73], heading: [47, 38, 27], body: [83, 71, 56], faint: [115, 98, 75], line: [205, 187, 155], badgeText: [255, 250, 239] },
  phone: "020 4628 3165", email: "hello@example.com", bookingUrl: "https://example.com/book", calculatorUrl: "https://example.com/offer#finance", addressLines: ["10 Harley Street"], dateStr: "23 September 2026", verdictLabel: "Consultation recommended", headline: "Your personal guide", score: 72, narrative: "A clinical discussion can help establish the right approach.", encouragement: "Bring your questions to the online call.", usedPhoto: false, lowerFaceObscured: false, areas: [], priceFrom: "£2,000", priceNote: "Final quote after consultation.", doctorName: "Dr Ayda Soltanzadeh", doctorRole: "Consultant Dermatologist", doctorProfile: "Your free 15-minute online consultation is the next step.", disclaimer: "General information only."
};

describe("report destinations", () => {
  it("embeds real booking and calculator URI annotations", async () => {
    const pdf = Buffer.from(await buildReportPdf(sample).arrayBuffer()).toString("latin1");
    expect(pdf).toContain("/URI (https://example.com/book)");
    expect(pdf).toContain("/URI (https://example.com/offer#finance)");
  });
});
