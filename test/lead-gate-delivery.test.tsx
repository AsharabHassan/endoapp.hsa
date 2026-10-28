import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LeadGateScreen } from "@/components/screens/LeadGateScreen";
import { useWizard } from "@/store/wizard-store";
import type { AnalyzeResult } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  submit: vi.fn(), report: vi.fn(), analysis: vi.fn(), track: vi.fn(),
}));
vi.mock("@/lib/api-client", () => ({
  submitLead: mocks.submit, submitReportToGhl: mocks.report,
  requestAnalysis: mocks.analysis,
}));
vi.mock("@/lib/meta-pixel", () => ({ trackMetaEvent: mocks.track }));

const result: AnalyzeResult = {
  bucket: "great",
  score: 90,
  hardFlags: [],
  softFlagged: false,
  routedReason: "",
  usedPhoto: true,
  lowerFaceObscured: false,
  areaEnhancements: {},
  framingAdequate: true,
  narrativeSource: "claude",
  narrative: { headline: "h", narrative: "n", observedAreas: [], encouragement: "e" },
};

beforeEach(() => {
  vi.clearAllMocks();
  useWizard.getState().reset();
  useWizard.getState().setResult(result);
  useWizard.getState().goToLead();
  mocks.submit.mockResolvedValue(true);
  mocks.report.mockResolvedValue(undefined);
});
afterEach(cleanup);

function fillLead() {
  render(<LeadGateScreen />);
  for (const [label, value] of [
    ["First name", "Test"], ["Last name", "Preview"],
    ["Email", "test@example.test"], ["Best number for your consultation call", "07700900123"],
  ]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
  return screen.getByRole("button", { name: "See my guide" });
}

describe("consultation call request", () => {
  it("sends the consent wording, time and preferred call time with the lead", async () => {
    useWizard.getState().setContactConsent(true);
    const button = fillLead();
    expect(screen.getByText(/will call you within minutes/)).toBeInTheDocument();
    expect(screen.queryByText(/0141 488 8985|020 4628 3165/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Afternoon" }));
    fireEvent.click(button);
    await waitFor(() => expect(mocks.submit).toHaveBeenCalledTimes(1));
    expect(mocks.submit).toHaveBeenCalledWith(expect.objectContaining({
      consultationContactConsent: true,
      consultationContactConsentAt: expect.stringMatching(/^\d{4}-/),
      consultationContactStatement: expect.stringContaining("call, text or WhatsApp me"),
      consultationContactConsentVersion: "consultation-contact-v1",
      preferredCallTime: "afternoon",
    }));
    // The optional marketing box is untouched and stays its own choice.
    expect(mocks.submit.mock.calls[0][0].lead.marketingConsent).toBe(false);
  });

  it("omits the call fields when no request or time was given", async () => {
    fireEvent.click(fillLead());
    await waitFor(() => expect(mocks.submit).toHaveBeenCalledTimes(1));
    const body = mocks.submit.mock.calls[0][0];
    expect(body).not.toHaveProperty("consultationContactConsent");
    expect(body).not.toHaveProperty("preferredCallTime");
  });

  it("toggles a chosen call time off again", () => {
    fillLead();
    const evening = screen.getByRole("button", { name: "Evening" });
    fireEvent.click(evening);
    expect(evening).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(evening);
    expect(evening).toHaveAttribute("aria-pressed", "false");
    expect(useWizard.getState().callTime).toBeNull();
  });
});
