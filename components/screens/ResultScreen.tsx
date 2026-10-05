"use client";

import { ReportOverview } from "@/components/result/ReportOverview";
import { TreatmentScience } from "@/components/result/TreatmentScience";
import { Reveal } from "@/components/ui/Reveal";
import { useState } from "react";
import { ArrowRight, Download, Loader2 } from "lucide-react";
import { useWizard } from "@/store/wizard-store";

import { WhatToExpect } from "@/components/result/WhatToExpect";
import { ResultsGallery } from "@/components/result/ResultsGallery";
import { Testimonials } from "@/components/result/Testimonials";
import { BookingCTA, openEmbeddedBooking } from "@/components/result/BookingCTA";
import { BookingCalendar } from "@/components/offer/BookingCalendar";
import { DoctorProfile } from "@/components/result/DoctorProfile";

import { DisclaimerBanner } from "@/components/compliance/DisclaimerBanner";
import { FinanceCalculator } from "@/components/offer/FinanceCalculator";
import { BOOKING_URL } from "@/lib/constants";



export function ResultScreen() {
  const result = useWizard((s) => s.result);
  const imageBase64 = useWizard((s) => s.imageBase64);
  const imageMediaType = useWizard((s) => s.imageMediaType);
  const landmarks = useWizard((s) => s.landmarks);
  const lead = useWizard((s) => s.lead);
  const [downloading, setDownloading] = useState(false);
  if (!result) return null;




  async function downloadReport() {
    if (!result) return;
    setDownloading(true);
    try {
      const { generateReportPdf } = await import("@/lib/report");
      const blob = await generateReportPdf({ result, imageBase64, imageMediaType, landmarks, lead });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Endomax-Lift-Report${lead?.firstName ? `-${lead.firstName}` : ""}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } finally { setDownloading(false); }
  }

  return (
    <div className="relative w-full overflow-hidden bg-[#f3ecdf] pb-28 text-[#302719] md:pb-10">
      <ReportOverview />
      <TreatmentScience />

      <div id="finance" className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.75fr_1fr] lg:items-center lg:py-24">
        <div><p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#96733b]">Plan with clarity</p><h2 className="mt-3 font-serif text-4xl !text-[#302719]">Endomax Lift packages from £2,000.</h2><p className="mt-5 text-sm leading-[1.8] text-[#625648]">Explore monthly payments with the calculator. Your treatment plan, exact cost and finance eligibility are confirmed after consultation.</p><Reveal className="mt-8"><DoctorProfile /></Reveal></div>
        <Reveal><FinanceCalculator /></Reveal>
      </div>

      <div className="report-dark bg-[#3a3026] px-5 py-16 sm:px-8"><div className="mx-auto max-w-5xl"><Reveal><WhatToExpect /></Reveal><Reveal><ResultsGallery /></Reveal><details className="mt-10 rounded-2xl border border-white/15 p-5"><summary className="cursor-pointer font-serif text-xl text-[#fff8eb]">Patient experiences</summary><Testimonials /></details><div className="mt-12 rounded-[2rem] border border-[#b9975d]/40 bg-[#4b3c2b] p-7 text-center"><h2 className="font-serif text-3xl text-[#fff8eb]">Discuss your guide with Dr Ayda</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#d7c9b4]">Your free 15-minute online call is the next step. Bring your questions; a phone call is available if video does not suit you.</p><div className="mx-auto mt-7 max-w-sm"><BookingCTA embedded /></div></div></div></div>
      <section id="consultation" tabIndex={-1} aria-labelledby="consultation-title" className="mx-auto max-w-5xl scroll-mt-28 px-3 pt-14 outline-none sm:px-8">
        <div className="mb-7 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#95743d]">Your next step</p>
          <h2 id="consultation-title" className="mt-3 font-serif text-3xl !text-[#302719] sm:text-4xl">Book your free online consultation</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#625648]">Choose a time for your 15-minute online consultation with Dr Ayda. A phone call is available if video does not suit you.</p>
          {lead && <p className="mt-3 text-xs text-[#755f3f]">Your contact details will be filled in for you. Please check them before confirming your appointment.</p>}
        </div>
        <BookingCalendar calendarUrl={BOOKING_URL} lead={lead} />
      </section>
      <div className="mx-auto max-w-5xl px-5 py-10 text-center sm:px-8"><button onClick={downloadReport} disabled={downloading} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#b79b6c] px-5 text-sm font-medium text-[#47351b] transition hover:bg-[#e9dcc3] disabled:opacity-60">{downloading ? <><Loader2 size={16} className="animate-spin" /> Preparing report…</> : <><Download size={16} /> Download your PDF report</>}</button><DisclaimerBanner className="mt-8" /></div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#c6ab7a] bg-[#f9f1e4]/95 p-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-15px_45px_-20px_rgba(61,42,16,.45)] backdrop-blur-xl md:hidden"><a href="#consultation" onClick={openEmbeddedBooking} className="cinematic-button flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#30271c] px-4 text-center text-sm font-semibold text-[#fff8e9]"><span>Book free online consultation</span><ArrowRight size={17} /></a></div>
    </div>
  );
}

