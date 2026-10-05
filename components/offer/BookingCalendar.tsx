"use client";

import { CalendarHeart, Phone, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OFFER, BOOKING_URL, CLINIC } from "@/lib/constants";
import type { Lead } from "@/lib/types";
import { prefillBookingUrl } from "@/lib/booking";
import { trackBookingStarted } from "@/lib/meta-pixel";

/**
 * Booking section body. Two modes:
 *
 * 1. When a calendar URL is supplied (the report uses BOOKING_URL),
 *    the calendar is embedded directly in the page as a
 *    plain iframe. Deliberately no GHL form_embed.js helper: that script
 *    hides the iframe behind a postMessage handshake that can fail, leaving
 *    it permanently invisible (verified on the MEDfacials sister app).
 *
 * 2. When no calendar widget is configured for the offer page, a booking
 *    panel with the booking site, both clinics' phone lines and WhatsApp.
 */
export function BookingCalendar({ calendarUrl = OFFER.calendarUrl, lead }: { calendarUrl?: string; lead?: Lead | null }) {
  if (calendarUrl) {
    const bookingUrl = prefillBookingUrl(calendarUrl, lead);
    return (
      <div>
        <p className="mb-4 text-center text-sm text-body/80">
          Calendar not showing?{" "}
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" onClick={trackBookingStarted}
            className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-peach underline underline-offset-4">
            Open the calendar in a new tab <ExternalLink size={14} />
          </a>
        </p>
        <div className="overflow-hidden rounded-2xl border border-peach/20 bg-white shadow-soft">
          <iframe
            src={bookingUrl}
            title="Book your free Endomax Lift online consultation with Dr Ayda"
            id="endomax-consult-calendar"
            referrerPolicy="no-referrer"
            loading="eager"
            className="block h-[1120px] w-full border-0 max-sm:h-[980px]"
          />
        </div>
        <div className="mt-4 flex flex-col items-center gap-2 text-sm text-body/80 sm:flex-row sm:justify-center sm:gap-6">
          <a
            href={CLINIC.phoneHref}
            className="inline-flex items-center gap-1.5 font-medium text-peach transition hover:text-peach-light"
          >
            <Phone size={14} /> Or call us on {CLINIC.phone}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-[#d6c19b] bg-[#fffaf1] px-6 py-10 text-center shadow-[0_25px_65px_-40px_rgba(87,57,15,.5)] sm:px-10">
      <CalendarHeart size={28} className="mx-auto text-peach" />
      <h3 className="mt-4 font-serif text-2xl text-heading">
        Reserve your free online consultation
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-body/80">
        Choose a time for your 15-minute online conversation with Dr Ayda.
        If you prefer a phone call, contact the clinic after booking.
      </p>

      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block"
      >
        <Button size="lg">
          <CalendarHeart size={18} /> Book your free online consultation
        </Button>
      </a>

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
