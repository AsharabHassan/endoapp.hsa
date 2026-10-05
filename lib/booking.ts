import type { Lead } from "./types";

/** Pass only contact fields to the existing clinic calendar, never photo findings. */
export function prefillBookingUrl(baseUrl: string, lead?: Lead | null): string {
  if (!lead) return baseUrl;
  const url = new URL(baseUrl);
  const fields = {
    first_name: lead.firstName,
    last_name: lead.lastName,
    email: lead.email,
    phone: normalizeBookingPhone(lead.phone),
  };
  for (const [key, value] of Object.entries(fields)) {
    if (value.trim()) url.searchParams.set(key, value.trim());
  }
  return url.toString();
}

function normalizeBookingPhone(phone: string): string {
  const compact = phone.trim().replace(/[\s().-]/g, "");
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  // The clinic's form accepts UK national numbers as well as international ones.
  if (/^0\d{10}$/.test(compact)) return `+44${compact.slice(1)}`;
  return compact;
}
