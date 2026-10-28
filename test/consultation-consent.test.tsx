import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConsentCaptureScreen } from "@/components/screens/ConsentCaptureScreen";
import { useWizard } from "@/store/wizard-store";
import {
  CONSULTATION_CONTACT_STATEMENT,
  readConsultationRequest,
} from "@/lib/consultation-consent";

const NOW = "2026-06-04T10:00:00.000Z";

describe("readConsultationRequest", () => {
  it("keeps a valid call request and preferred time", () => {
    expect(readConsultationRequest({
      consultationContactConsent: true,
      consultationContactConsentAt: "2026-06-04T09:50:00.000Z",
      consultationContactStatement: CONSULTATION_CONTACT_STATEMENT,
      consultationContactConsentVersion: "consultation-contact-v1",
      preferredCallTime: "morning",
    }, NOW)).toEqual({
      consultationContact: {
        at: "2026-06-04T09:50:00.000Z",
        statement: CONSULTATION_CONTACT_STATEMENT,
        version: "consultation-contact-v1",
      },
      preferredCallTime: "morning",
    });
  });

  it("drops anything malformed rather than forwarding it", () => {
    expect(readConsultationRequest({
      consultationContactConsent: "yes",
      preferredCallTime: "midnight",
    }, NOW)).toEqual({ consultationContact: undefined, preferredCallTime: undefined });
    const { consultationContact } = readConsultationRequest({
      consultationContactConsent: true,
      consultationContactConsentAt: "not a date",
      consultationContactStatement: "x".repeat(900),
    }, NOW);
    expect(consultationContact?.at).toBe(NOW);
    expect(consultationContact?.statement).toHaveLength(500);
    expect(consultationContact?.version).toBe("");
  });

  it("is a request for contact, not marketing", () => {
    expect(CONSULTATION_CONTACT_STATEMENT).toContain("free consultation");
    expect(CONSULTATION_CONTACT_STATEMENT).not.toMatch(/offer|news|marketing/i);
  });
});


describe("consent screen gate", () => {
  beforeEach(() => {
    useWizard.getState().reset();
    useWizard.getState().start();
    Element.prototype.scrollIntoView = vi.fn();
    // jsdom has no IntersectionObserver; the screen's Reveal wrappers need one.
    vi.stubGlobal("IntersectionObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("blocks the photo until the consultation request is ticked", () => {
    render(<ConsentCaptureScreen />);
    const consult = screen.getByRole("checkbox", { name: /requesting a free consultation/ });
    expect(consult).not.toBeChecked();
    fireEvent.click(screen.getByRole("checkbox", { name: /consent to my photo/ }));
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const openPicker = vi.spyOn(fileInput, "click");

    fireEvent.click(screen.getByRole("button", { name: /Upload photo/ }));
    expect(openPicker).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("Please tick the box");
    expect(consult).toHaveAttribute("aria-invalid", "true");
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();

    fireEvent.click(consult);
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Upload photo/ }));
    expect(openPicker).toHaveBeenCalledTimes(1);
  });
});
