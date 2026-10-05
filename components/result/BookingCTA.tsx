"use client";

import { CalendarHeart, Phone } from "lucide-react";
import { BOOKING_URL, CLINIC } from "@/lib/constants";
import { trackBookingStarted } from "@/lib/meta-pixel";

export function BookingCTA({ tone = "dark", embedded = false }: { tone?: "dark" | "light"; embedded?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <a
        href={embedded ? "#consultation" : BOOKING_URL}
        target={embedded ? undefined : "_blank"}
        rel={embedded ? undefined : "noopener noreferrer"}
        className="cinematic-button inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#a47b2f] via-[#d6b76c] to-[#ab8237] px-5 text-center text-sm font-bold text-[#21190e] shadow-[0_18px_42px_-18px_rgba(132,91,22,0.7)] transition duration-300 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b48b3b] sm:w-auto sm:px-8 sm:text-base"
        onClick={embedded ? openEmbeddedBooking : trackBookingStarted}
      >
        <CalendarHeart size={18} /> Book free online consultation
      </a>
      <a
        href={CLINIC.phoneHref}
        className={`flex items-center gap-2 text-sm font-medium transition hover:underline ${tone === "light" ? "text-[#72572c]" : "text-[#d8b96e]"}`}
      >
        <Phone size={14} /> Or call us on {CLINIC.phone}
      </a>
    </div>
  );
}

export function openEmbeddedBooking(event: React.MouseEvent<HTMLAnchorElement>) {
  const section = document.getElementById("consultation");
  if (!section) return;
  event.preventDefault();
  trackBookingStarted();
  section.focus({ preventScroll: true });
  section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
}
