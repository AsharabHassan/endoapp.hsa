"use client";

import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { EASE } from "@/lib/motion";

// ─────────────────────────────────────────────────────────────────────────────
// Verified patient reviews (Google, 2026). Lightly copy-edited for spelling only —
// wording and meaning preserved from the original reviews.
// ─────────────────────────────────────────────────────────────────────────────

interface Testimonial {
  name: string;
  date: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Thoney James",
    date: "February 2026",
    quote:
      "I had an amazing experience with Harley Street Aesthetics. I've now visited for two different treatments, and I couldn't be happier with the consistency of their service. My first visit was for Botox, and I was naturally a bit nervous about looking 'frozen.' The team was incredible; they took their time to explain the process and focused on a conservative approach that smoothed out my fine lines while still allowing for natural movement. The results were flawless and lasted much longer than I expected. Because I was so impressed the first time, I recently went back for skin boosters. The difference in my skin's hydration and overall 'glow' is remarkable — my complexion looks much more refreshed and plump, which is exactly what I was looking for. What sets this clinic apart is its professional, clinical environment and the fact that it never pushes unnecessary treatments. They truly listen to your goals. I feel very safe in their hands and won't go anywhere else for my aesthetic needs.",
  },
  {
    name: "Martins Smith",
    date: "February 2026",
    quote:
      "From the moment I walked into Harley Street Aesthetics, I knew I was in expert hands. The clinic is pristine, the staff is incredibly welcoming, and the attention to detail unmatched. They took the time to listen to my concerns and delivered results that exceeded my expectations. If you're looking for natural, professional, and high-end aesthetic care, look no further.",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonials() {
  return (
    <div>
      <h3 className="text-center font-serif text-xl text-heading">
        What our patients say
      </h3>

      <div className="mx-auto mt-5 grid max-w-3xl gap-4 sm:grid-cols-2">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.5, ease: EASE }}
            className="relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-soft"
          >
            <Quote
              size={28}
              className="absolute right-4 top-4 text-peach/30"
              aria-hidden
            />

            <div
              className="flex gap-0.5 text-peach"
              aria-label="Five out of five stars"
            >
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </div>

            <blockquote className="mt-3 flex-1 text-[13px] leading-relaxed text-body">
              “{t.quote}”
            </blockquote>

            <figcaption className="mt-4 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-peach/30 bg-peach/15 text-xs font-semibold text-peach">
                {initials(t.name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-heading">
                  {t.name}
                </span>
                <span className="block text-[11px] text-body/60">{t.date}</span>
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  );
}
