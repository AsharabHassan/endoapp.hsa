"use client";

import { motion } from "motion/react";
import { Camera, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizard } from "@/store/wizard-store";
import { EASE } from "@/lib/motion";

/**
 * Shown when the photo didn't clearly capture the lower face / neck — the areas
 * the Endomax Lift treats. A better photo is optional; continuing opens a
 * general consultation guide without unsupported personalised findings.
 */
export function RetakeScreen() {
  const retakePhoto = useWizard((s) => s.retakePhoto);
  const goToStep = useWizard((s) => s.goToStep);

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-col items-center"
      >
        <span className="grid h-16 w-16 place-items-center rounded-full border border-[#c9ae7c] bg-[#fff9ee] text-[#9a773e] shadow-[0_15px_35px_-22px_rgba(90,60,18,.5)]">
          <ScanFace size={28} />
        </span>
        <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#c9ae7c] bg-[#fff9ee] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a773e]">
          Your photo is received
        </span>
        <h2 className="mt-4 font-serif text-[clamp(2.4rem,5vw,3.5rem)] leading-tight !text-[#302719]">
          Continue, or try another photo
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[#625648]">
          There isn&rsquo;t enough visible detail for a personalised photo guide.
          You can continue to a general guide and book your free online consultation
          with Dr Ayda. Another photo is optional.
        </p>

        <Button size="lg" onClick={() => goToStep("lead")} className="mt-8 w-full">
          Continue without retaking
        </Button>
        <Button variant="outline" size="lg" onClick={retakePhoto} className="mt-3 w-full">
          <Camera size={18} /> Try another photo
        </Button>
        <p className="mt-5 text-xs leading-relaxed text-[#776345]">For more detail, face the camera in even light, with your chin level and your jawline and neck in frame.</p>
      </motion.div>
    </section>
  );
}
