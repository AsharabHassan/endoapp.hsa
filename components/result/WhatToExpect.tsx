"use client";

import { motion } from "motion/react";
import { Zap, Hourglass, Leaf, BadgePoundSterling } from "lucide-react";
import { PRICE_GUIDE } from "@/lib/constants";

const POINTS = [
  {
    icon: Zap,
    title: "Minimally invasive",
    body: "A fine laser fibre is introduced beneath the skin through a small entry point. Your clinician will explain the procedure and anaesthetic.",
  },
  {
    icon: Hourglass,
    title: "Little downtime",
    body: "Recovery varies. Temporary redness or swelling can occur, and your clinician will explain what to expect for your plan.",
  },
  {
    icon: Leaf,
    title: "Builds over months",
    body: "Changes may develop over time as the skin responds. The degree and timing of any result vary between people.",
  },
];

export function WhatToExpect() {
  return (
    <div>
      <h3 className="font-serif text-xl text-heading">What to expect</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {POINTS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <p.icon size={20} className="text-peach" />
            <p className="mt-3 text-sm font-semibold text-heading">{p.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-body">{p.body}</p>
          </motion.div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-body">
        <BadgePoundSterling size={16} className="text-sage-deep" />
        <span>
          Endomax Lift at Harley Street Aesthetics from{" "}
          <span className="font-semibold text-heading">{PRICE_GUIDE.from}</span>.{" "}
          <span className="text-body/70">{PRICE_GUIDE.note}</span>
        </span>
      </p>
    </div>
  );
}
