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
    expect(html).toContain('id="endomax-consult-calendar"');
    expect(html).toContain("first_name=Preview");
  });
});
