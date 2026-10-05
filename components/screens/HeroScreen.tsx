"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Camera, ShieldCheck, Video } from "lucide-react";
import { useWizard } from "@/store/wizard-store";
import { EASE } from "@/lib/motion";
import { useLightFx } from "@/lib/use-light-fx";
import { ContourArtwork } from "@/components/ui/ContourArtwork";
import { Reveal } from "@/components/ui/Reveal";

export function HeroScreen() {
  const start = useWizard((s) => s.start);
  const reduce = useReducedMotion();
  const light = useLightFx();
  return (
    <section className="relative isolate overflow-hidden bg-[#e9ddc9] text-[#2b241a]">
      <div aria-hidden="true" className={`absolute -inset-5 -z-20 ${light ? "" : "hero-atmosphere"}`}>
        <Image src="/visuals/champagne-silk.png" alt="" fill priority sizes="100vw" className="object-cover object-[62%_center]" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f5ecdc]/95 via-[#f4ead9]/85 to-[#f4ead9]/25" />
      <div className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-6xl items-center gap-6 px-6 pb-10 pt-10 sm:px-10 sm:py-14 md:grid-cols-[1.15fr_.85fr] lg:gap-12 lg:px-12">
        <div className="relative z-10">
          <Reveal><span className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.24em] text-[#836329]"><span className="h-px w-8 bg-[#b08b50]" /> A considered first step</span></Reveal>
          <h1 className="mt-6 font-serif text-[clamp(3.45rem,6.8vw,6.2rem)] leading-[1.05] tracking-[-.055em] !text-[#302719]">
            {["Your face.", "Your guide.", "Your choice."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span className={`block ${i === 1 ? "font-normal italic text-[#9f7938]" : ""}`}
                  initial={reduce ? false : { y: "108%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: .7, delay: i * .09, ease: EASE }}>
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <Reveal delay={.12}>
            <p className="mt-5 max-w-lg text-sm leading-[1.85] text-[#51473a] sm:text-base">Submit a selfie for a personalised Endomax Lift guide. See which areas may be worth discussing, then speak with Dr Ayda in a free 15-minute online consultation.</p>
            <button onClick={start} className="cinematic-button group mt-7 inline-flex min-h-14 items-center justify-center gap-5 rounded-full bg-[#30271c] px-7 text-sm font-semibold text-[#fff9ef] shadow-[0_18px_40px_-19px_rgba(67,44,16,.75)] transition duration-300 hover:bg-[#6d5128] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9f7938]">
              Begin with your selfie <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-[#6b5a43]">
              <span className="inline-flex items-center gap-1.5"><Camera size={14} /> Camera or upload</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> Private report</span>
              <span className="inline-flex items-center gap-1.5"><Video size={14} /> Online consultation</span>
            </div>
          </Reveal>
        </div>
        <Reveal delay={.2} className="relative mx-auto w-full max-w-[260px] md:max-w-none">
          <ContourArtwork priority />
          <div className="mt-3 hidden items-center justify-center gap-4 text-[9px] font-semibold uppercase tracking-[.22em] text-[#886b3c] md:flex"><span className="h-px w-8 bg-[#b08b50]/50" /> Endomax Lift <span className="h-px w-8 bg-[#b08b50]/50" /></div>
        </Reveal>
      </div>
      <div className="border-t border-[#b6955e]/30 bg-[#fff8ea]/40 px-6 py-5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-x-5 gap-y-3 text-[10px] font-semibold uppercase tracking-[.15em] text-[#806a49] sm:text-xs">
          <span><span className="mr-2 text-[#ac8c54]">01</span> Your selfie</span>
          <span><span className="mr-2 text-[#ac8c54]">02</span> Your personal guide</span>
          <span><span className="mr-2 text-[#ac8c54]">03</span> A conversation</span>
        </div>
      </div>
    </section>
  );
}
