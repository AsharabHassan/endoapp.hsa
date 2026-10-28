"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Step } from "@/store/wizard-store";
import { JOURNEY, journeyIndex } from "@/lib/consultation-journey";

/** Labelled 4-stage tracker. The consultation is a visible stage, so the guide is never the finish line. */
export function ProgressRail({ step }: { step: Step }) {
  const active = journeyIndex(step);
  if (active < 0) return null;

  return (
    <nav aria-label="Your consultation journey" className="flex items-center">
      <p className="shrink-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a674b] sm:hidden">
        Step {active + 1} of {JOURNEY.length}
      </p>
      <ol className="hidden items-center gap-1.5 sm:flex">
        {JOURNEY.map((stage, i) => {
          const done = i < active;
          const now = i === active;
          return (
            <li key={stage.key} className="flex items-center gap-1.5" aria-current={now ? "step" : undefined}>
              {i > 0 && (
                <span className="relative h-px w-5 overflow-hidden bg-[#d5c3a1] md:w-8">
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-[#9f7938]"
                    initial={false}
                    animate={{ width: i <= active ? "100%" : "0%" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              )}
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  done
                    ? "border-[#9f7938] bg-[#9f7938] text-[#fff9ef]"
                    : now
                      ? "border-[#9f7938] bg-[#fff9ef] text-[#7d5d27]"
                      : "border-[#cdb994] text-[#a08d6e]"
                }`}
              >
                {done ? <Check size={11} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  now ? "text-[#302719]" : "text-[#8c7a5d]"
                }`}
              >
                {stage.short}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
