"use client";

import { CalendarHeart, Check, Lock, PhoneCall, UserPlus } from "lucide-react";
import { JOURNEY } from "@/lib/consultation-journey";
import { CLINIC } from "@/lib/constants";
import { CALLBACK_PROMISE, clinicVCard } from "@/lib/consultation-consent";
import { openEmbeddedBooking } from "./BookingCTA";
import { useWizard } from "@/store/wizard-store";
import { lowerFaceProfile } from "@/lib/lower-face-profile";

/**
 * Top-of-result framing: the guide is step 2 of 4 and the consultation with
 * Dr Ayda is what turns it into a real plan. Stops clients treating the AI
 * read as the end of the journey.
 */
export function NextStepCard() {
  const result = useWizard((s) => s.result);
  // Lead with what the scan identified — the guide's core value.
  const profile = result ? lowerFaceProfile(result) : null;
  const named = [
    profile?.jowls && profile.jowls.key !== "none" ? profile.jowls.name : null,
    profile?.neck && profile.neck.key !== "minimal" ? profile.neck.name : null,
  ].filter(Boolean) as string[];
  const finding = named.length ? named.join(" and ").toLowerCase() : null;

  return (
    <section
      aria-label="Your next step"
      className="mb-10 overflow-hidden rounded-[2rem] border border-[#c9ab74] bg-[#fffaf1]/95 shadow-[0_28px_70px_-45px_rgba(93,64,23,.5)]"
    >
      <div className="border-b border-[#dcc8a3] bg-[#f3e7cf] px-6 py-3 text-center text-[10px] font-bold uppercase tracking-[.2em] text-[#8f6e34] sm:text-[11px]">
        Step 2 of 4 complete · Your findings are ready
      </div>

      <div className="p-6 sm:p-8">
        <h2 className="font-serif text-[26px] leading-tight !text-[#302719] sm:text-[32px]">
          {finding ? (
            <>
              Your guide has identified{" "}
              <span className="text-[#9f7938]">{finding}</span>. Now let&rsquo;s
              treat it.
            </>
          ) : (
            <>Your guide is ready. Now let&rsquo;s turn it into results.</>
          )}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-[1.8] text-[#625342]">
          Your guide names what&rsquo;s happening along your jawline and neck
          and why. In your free 15-minute online consultation, Dr Ayda builds
          your treatment plan around these findings &mdash; going through the
          detail with you, checking your medical history and suitability for
          Endomax Lift, and giving you a clear plan and price.
        </p>

        <ol className="mt-6 grid gap-3 sm:grid-cols-4 sm:gap-2">
          {JOURNEY.map((stage, i) => {
            const done = i < 2;
            const next = i === 2;
            return (
              <li
                key={stage.key}
                aria-current={next ? "step" : undefined}
                className={`flex items-start gap-3 rounded-2xl border px-3 py-3 sm:flex-col sm:gap-2 ${
                  next ? "border-[#9f7938] bg-[#f6ead2]" : "border-[#e2d3b6] bg-transparent"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    done
                      ? "bg-[#9f7938] text-[#fff9ef]"
                      : next
                        ? "border border-[#9f7938] bg-[#fff9ef] text-[#7d5d27]"
                        : "border border-[#cdb994] text-[#a08d6e]"
                  }`}
                >
                  {done ? <Check size={12} strokeWidth={3} /> : i < 3 ? i + 1 : <Lock size={11} />}
                </span>
                <span>
                  <span className={`block text-[13px] font-semibold ${next ? "text-[#302719]" : "text-[#6b5a43]"}`}>
                    {stage.label}
                    {next && <span className="ml-1.5 whitespace-nowrap text-[#9f7938]">&larr; you&rsquo;re here</span>}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-[#786954]">{stage.detail}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-7 flex flex-col items-center gap-2">
          <a
            href="#consultation"
            onClick={openEmbeddedBooking}
            className="cinematic-button inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#30271c] px-7 text-sm font-semibold text-[#fff9ef] shadow-[0_18px_40px_-19px_rgba(67,44,16,.75)] transition duration-300 hover:bg-[#6d5128] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9f7938] sm:w-auto"
          >
            <CalendarHeart size={18} /> Book my free consultation
          </a>
          <p className="text-xs text-[#786954]">Free · 15 minutes online with Dr Ayda · No obligation to go ahead</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#e2d3b6] bg-[#f8eedc]/70 p-4 sm:flex-row sm:items-center">
          <PhoneCall size={20} className="shrink-0 text-[#9f7938]" />
          <p className="flex-1 text-sm leading-relaxed text-[#625342]">
            <span className="font-semibold text-[#302719]">Expect our call {CALLBACK_PROMISE}</span>{" "}
            from <span className="whitespace-nowrap font-semibold text-[#302719]">{CLINIC.phone}</span>{" "}
            &mdash; if you haven&rsquo;t booked yet, we&rsquo;ll go through your guide
            and find a time that suits you.
          </p>
          <a
            href={`data:text/vcard;charset=utf-8,${encodeURIComponent(clinicVCard())}`}
            download={`${CLINIC.name}.vcf`}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#c9ab74] px-4 py-2 text-sm font-semibold text-[#302719] transition hover:bg-[#f3e7cf]"
          >
            <UserPlus size={15} /> Save our number
          </a>
        </div>
      </div>
    </section>
  );
}
