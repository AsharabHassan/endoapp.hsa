import { describe, expect, it } from "vitest";
import { prefillBookingUrl } from "@/lib/booking";
import type { Lead } from "@/lib/types";

const base = "https://link.harleystreetaesthetic.co.uk/widget/bookings/aesthetic-consultant-1";
const lead: Lead = {
  firstName: " Anne-Marie ", lastName: "O’Neil & Jones", email: "preview+test@example.com",
  phone: "07700 900123", marketingConsent: true,
};

describe("calendar contact prefill", () => {
  it("encodes contact fields, preserves calendar options and excludes consent or assessment fields", () => {
    const url = new URL(prefillBookingUrl(`${base}?locale=en`, {
      ...lead, score: 88, imageBase64: "sensitive", treatmentCity: "London",
    } as Lead));
    expect(Object.fromEntries(url.searchParams)).toEqual({
      locale: "en", first_name: "Anne-Marie", last_name: "O’Neil & Jones",
      email: "preview+test@example.com", phone: "+447700900123",
    });
  });

  it.each(["+44 7700 900123", "0044 7700 900123"])("preserves the international prefix in %s", (phone) => {
    expect(new URL(prefillBookingUrl(base, { ...lead, phone })).searchParams.get("phone")).toBe("+447700900123");
  });

  it("preserves non-UK international numbers", () => {
    expect(new URL(prefillBookingUrl(base, { ...lead, phone: "+1 (202) 555-0123" })).searchParams.get("phone")).toBe("+12025550123");
  });

  it("leaves a contact-free URL intact and skips empty fields", () => {
    expect(prefillBookingUrl(base, null)).toBe(base);
    expect(new URL(prefillBookingUrl(base, { ...lead, lastName: " " })).searchParams.has("last_name")).toBe(false);
  });
});
