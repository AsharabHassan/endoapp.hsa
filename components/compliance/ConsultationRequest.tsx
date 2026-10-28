"use client";

import { PhoneCall } from "lucide-react";
import { ConsentCheckbox } from "@/components/compliance/ConsentCheckbox";
import { CLINIC } from "@/lib/constants";
import {
  CALLBACK_PROMISE,
  CONSENT_DETAIL,
  CONSENT_HEADLINE,
} from "@/lib/consultation-consent";

interface ConsultationRequestProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Highlight the box after the client tried to continue without ticking it. */
  invalid?: boolean;
}

const STEPS = [
  "Scan your face",
  "Get your guide",
  "Our team calls you",
  "Free consultation",
] as const;

/**
 * "What happens next" + the explicit, unticked-by-default request for our team
 * to contact the client. Shown before the scan so nobody is surprised by the
 * call: the scan is the start of a consultation, not a free AI toy.
 */
export function ConsultationRequest({ checked, onChange, invalid }: ConsultationRequestProps) {
  return (
    <div
      id="consultation-request"
      className={`rounded-2xl border p-4 transition ${
        invalid && !checked
          ? "border-[#a98543] bg-[#f3e7cf]"
          : "border-[#dcc8a3] bg-[#f8eedc]/70"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[.17em] text-[#9a773e]">
        What happens next
      </p>
      <ol className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px] text-[#302719] sm:grid-cols-4">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-start gap-2">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                i === 2 ? "bg-[#9f7938] text-[#fff9ef]" : "border border-[#b9a580] text-[#7d5d27]"
              }`}
            >
              {i === 2 ? <PhoneCall size={10} /> : i + 1}
            </span>
            <span className={`leading-snug ${i === 2 ? "font-semibold" : ""}`}>{label}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[13px] leading-relaxed text-[#645746]">
        This scan is the first step of your free consultation. Once your guide
        is ready, a member of our team will call you {CALLBACK_PROMISE} from{" "}
        <span className="whitespace-nowrap font-semibold text-[#302719]">{CLINIC.phone}</span>{" "}
        to go through it and book your consultation with Dr Ayda.
      </p>

      <ConsentCheckbox checked={checked} onChange={onChange} invalid={invalid} className="mt-4">
        <strong className="text-[#302719]">{CONSENT_HEADLINE}</strong> {CONSENT_DETAIL}
      </ConsentCheckbox>
      {invalid && !checked && (
        <p role="alert" className="mt-2 text-xs font-semibold text-[#7d5d27]">
          Please tick the box to start your scan. The scan is part of your free
          consultation, so our team needs to be able to contact you.
        </p>
      )}
      <p className="mt-2 text-[11px] leading-relaxed text-[#776850]">
        This is how we arrange the consultation you&rsquo;re asking for, not
        marketing. You can tell us to stop at any time.
      </p>
    </div>
  );
}
