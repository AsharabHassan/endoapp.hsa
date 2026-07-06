"use client";

import { CalendarHeart, Phone, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OFFER, BOOKING_URL, CLINIC } from "@/lib/constants";

/**
 * Booking section body. Two modes:
 *
 * 1. When OFFER.calendarUrl is set (NEXT_PUBLIC_OFFER_CALENDAR_URL — a GHL
 *    booking-widget URL), the calendar is embedded directly in the page as a
 *    plain iframe. Deliberately no GHL form_embed.js helper: that script
 *    hides the iframe behind a postMessage handshake that can fail, leaving
 *    it permanently invisible (verified on the MEDfacials sister app).
 *
 * 2. While no calendar widget is configured (HSA's current state), a booking
 *    panel with the booking site, both clinics' phone lines and WhatsApp.
 */
export function BookingCalendar() {
  if (OFFER.calendarUrl) {
    return (
      <div>
        <div className="overflow-hidden rounded-2xl border border-peach/20 bg-white shadow-soft">
          <iframe
            src={OFFER.calendarUrl}
            title="Book your free Endomax Lift consultation"
            id="endomax-consult-calendar"
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
          <a
            href={OFFER.calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-peach transition hover:text-peach-light"
          >
            <ExternalLink size={14} /> Open the calendar in a new tab
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-peach/20 bg-white/[0.04] px-6 py-10 text-center shadow-soft sm:px-10">
      <CalendarHeart size={28} className="mx-auto text-peach" />
      <h3 className="mt-4 font-serif text-2xl text-heading">
        Reserve your free consultation
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-body/80">
        Choose a time that suits you at our London or Glasgow clinic — or start
        with a quick call or WhatsApp message and we&apos;ll arrange it for
        you.
      </p>

      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block"
      >
        <Button size="lg">
          <CalendarHeart size={18} /> Book your free consultation
        </Button>
      </a>

      <div className="mx-auto mt-8 grid max-w-lg gap-4 text-left sm:grid-cols-2">
        {CLINIC.locations.map((loc) => (
          <div
            key={loc.city}
            className="rounded-xl border border-peach/15 bg-white/[0.03] p-4"
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
