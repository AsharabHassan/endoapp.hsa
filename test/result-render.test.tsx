import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { genericFallbackResult } from "@/lib/assessment";
import { ResultScreen } from "@/components/screens/ResultScreen";

vi.mock("@/store/wizard-store", () => ({
  useWizard: (select: (state: unknown) => unknown = (state) => state) => select({
    result: genericFallbackResult(true), imageBase64: null,
    imageMediaType: "image/jpeg", landmarks: null,
    lead: { firstName: "Preview", lastName: "Test", email: "preview@example.com", phone: "07700 900123", marketingConsent: false },
  }),
}));

describe("result screen runtime", () => {
  it("renders the report and booking handlers without an undefined reference", () => {
    const html = renderToStaticMarkup(<ResultScreen />);
    expect(html).toContain("Book free online consultation");
    expect(html).toContain('href="#consultation"');
    // The CRM booking page is embedded (no prefill), with a plain link under it.
    expect(html).toContain('id="endomax-consult-calendar"');
    expect(html).toContain('src="https://app.harleystreetaesthetic.co.uk/book/harley-street-aesthetic/free-online-consultation-with-aesthetic-"');
    expect(html).toContain('href="https://app.harleystreetaesthetic.co.uk/book/harley-street-aesthetic/free-online-consultation-with-aesthetic-"');
    expect(html).toContain("Open the booking page");
    expect(html).toContain('sandbox="allow-forms allow-scripts allow-same-origin');
    expect(html).not.toContain("first_name=");
    expect(html).not.toContain("filled in for you");
    // Journey framing: the guide is step 2 of 4, the consultation comes next.
    expect(html).toContain("Step 2 of 4 complete");
    expect(html).toContain("Book my free consultation");
    // The booking calendar sits above the finance block.
    expect(html.indexOf('id="consultation"')).toBeLessThan(html.indexOf('id="finance"'));
  });
});
