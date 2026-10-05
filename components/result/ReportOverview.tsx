"use client";
import { useWizard } from "@/store/wizard-store";
import { focusExplanations } from "@/lib/focus-findings";
import { regionMarkers } from "@/lib/face-regions";
import { FocusReasons } from "./FocusReasons";
import { LowerFaceProfile } from "./LowerFaceProfile";
import { BookingCTA } from "./BookingCTA";

export function ReportOverview() {
  const { result, imageBase64, imageMediaType, landmarks } = useWizard();
  if (!result) return null;
  const findings = focusExplanations(result);
  const regions = [...new Set(findings.map((item) => item.region))];
  return <section className="mx-auto max-w-6xl px-5 pb-14 pt-8 sm:px-8 sm:pt-12" aria-labelledby="photo-guide-title">
    <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-2xl">
      <p className="text-[10px] font-bold uppercase tracking-[.23em] text-[#95743d]">Your personalised Endomax Lift guide</p>
      <h1 id="photo-guide-title" className="mt-3 font-serif text-4xl leading-tight !text-[#302719] sm:text-5xl">{findings.length ? "Your photo, explained." : result.narrative.headline}</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#625342]">{findings.length ? "What stands out in your selfie, how the treatment works in those areas, and the changes it may help achieve." : result.narrative.narrative}</p>
      {findings.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{findings.map((item) => <span key={item.finding} className="rounded-full border border-[#d1ba91] bg-[#fbf5e8] px-3 py-1.5 text-xs font-medium text-[#735525]">{item.pattern}</span>)}</div>}
      </div>
      <div className="hidden shrink-0 lg:block"><BookingCTA tone="light" embedded /></div>
    </div>
    <LowerFaceProfile result={result} />
    <div className="grid items-start gap-7 md:grid-cols-[.7fr_1.3fr] md:gap-10">
      <div className="md:sticky md:top-28">
        {imageBase64 && <figure className="mx-auto max-w-[190px] overflow-hidden rounded-[2rem] border border-[#cbb38b] bg-[#ece1cc] shadow-[0_24px_60px_-36px_rgba(64,42,14,.6)] md:max-w-sm">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:${imageMediaType};base64,${imageBase64}`} alt={landmarks && findings.length ? "Your submitted selfie with visible focus areas highlighted" : "Your submitted selfie"} className="block h-auto w-full" />
            {landmarks && <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
              {regions.flatMap((region) => regionMarkers(region, landmarks).map((p, index) => <ellipse key={`${region}-${index}`} cx={p.cx * 100} cy={p.cy * 100} rx={p.rx * 100} ry={p.ry * 100} fill="rgba(218,177,86,.14)" stroke="#ebc778" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />))}
            </svg>}
          </div>
          <figcaption className="px-4 py-3 text-center text-xs font-medium text-[#69512d]">Your submitted selfie{findings.length > 0 && <> · {findings.map((item) => item.area).filter((a, i, all) => all.indexOf(a) === i).join(" / ")}</>}</figcaption>
        </figure>}
        <div className="mx-auto mt-5 hidden max-w-sm md:block"><BookingCTA tone="light" embedded /><p className="mt-3 text-center text-xs leading-relaxed text-[#715b39]">15 minutes online with Dr Ayda · phone fallback</p></div>
        <p className="mx-auto mt-4 max-w-sm text-center text-xs leading-relaxed text-[#786954]">Photo observations guide the conversation. Your practitioner confirms the underlying cause, suitability and likely benefit.</p>
      </div>
      <div>
        <FocusReasons result={result} />
        {!findings.length && <div className="rounded-2xl border border-[#d8c5a1] bg-[#fffcf5] p-6"><h2 className="font-serif text-2xl !text-[#302719]">A closer look comes next</h2><p className="mt-3 text-sm leading-relaxed text-[#625342]">{result.lowerFaceObscured ? "Facial hair limits the visible skin detail in this photo. The consultation can explore your jawline and neck goals." : "This image has not provided a clear area-specific finding. Your submitted photo is enough to continue to the consultation; another upload is optional."}</p></div>}
      </div>
    </div>
  </section>;
}
