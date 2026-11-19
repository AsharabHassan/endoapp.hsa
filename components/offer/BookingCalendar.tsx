"use client";

import { CalendarHeart, Phone, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL, CLINIC } from "@/lib/constants";
import { trackBookingStarted } from "@/lib/meta-pixel";

/**
 * Booking section body (result page and /offer): a button to the clinic's CRM
 * booking page, both clinics' phone lines and WhatsApp.
 *
 * The CRM booking page cannot be embedded (it sends X-Frame-Options: DENY and
 * frame-ancestors 'none') and reads no contact details from the address, so it
 * opens in a new tab and the patient types their details there.
 */
export function BookingCalendar() {
  return (
    <div className="rounded-[2rem] border border-[#d6c19b] bg-[#fffaf1] px-6 py-10 text-center shadow-[0_25px_65px_-40px_rgba(87,57,15,.5)] sm:px-10">
      <CalendarHeart size={28} className="mx-auto text-peach" />
      <h3 className="mt-4 font-serif text-2xl text-heading">
        Reserve your free online consultation
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-body/80">
        Choose a time for your 15-minute online conversation with our doctor.
        If you prefer a phone call, contact the clinic after booking.
      </p>

      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackBookingStarted}
        className="mt-6 inline-block"
      >
        <Button size="lg">
          <CalendarHeart size={18} /> See available times <ExternalLink size={15} />
        </Button>
      </a>
      <p className="mt-3 text-xs text-body/70">
        Opens our secure booking page in a new tab.
      </p>

      <div className="mx-auto mt-8 grid max-w-lg gap-4 text-left sm:grid-cols-2">
        {CLINIC.locations.map((loc) => (
          <div
            key={loc.city}
            className="rounded-xl border border-[#ddcaa7] bg-[#f7efdf] p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-peach">
              {loc.city}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-body/75">
              {loc.lines.join(", ")}
            </p>
            <a
              href={loc.phoneHref}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-heading transition hover:text-peach-light"
            >
              <Phone size={13} /> {loc.phone}
            </a>
          </div>
        ))}
      </div>

      <a
        href={CLINIC.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-peach transition hover:text-peach-light"
      >
        <MessageCircle size={15} /> WhatsApp us on {CLINIC.whatsapp}
      </a>
    </div>
  );
}
