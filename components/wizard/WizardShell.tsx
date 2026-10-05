"use client";

import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useWizard } from "@/store/wizard-store";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Logo } from "@/components/brand/Logo";
import { ClinicFooter } from "@/components/brand/ClinicFooter";
import { ProgressRail } from "./ProgressRail";
import { StepTransition } from "./StepTransition";
import { HeroScreen } from "@/components/screens/HeroScreen";
import { ConsentCaptureScreen } from "@/components/screens/ConsentCaptureScreen";
import { ScanScreen } from "@/components/screens/ScanScreen";
import { RetakeScreen } from "@/components/screens/RetakeScreen";
import { LeadGateScreen } from "@/components/screens/LeadGateScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";

const SCREENS = {
  hero: HeroScreen,
  consent: ConsentCaptureScreen,
  scan: ScanScreen,
  retake: RetakeScreen,
  lead: LeadGateScreen,
  result: ResultScreen,
} as const;

export function WizardShell() {
  const step = useWizard((s) => s.step);
  const Screen = SCREENS[step];
  const showFooter = step === "hero" || step === "result";

  return (
    <MotionConfig reducedMotion="user">
    <div className="journey-light relative isolate flex min-h-dvh flex-col">
      <AmbientBackground tone="warm" />
      <CinematicHeader hero={step === "hero"} step={step} />

      <main className="flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: "instant" })}>
          <StepTransition key={step}>
            <Screen />
          </StepTransition>
        </AnimatePresence>
      </main>

      {showFooter && <ClinicFooter />}
    </div>
    </MotionConfig>
  );
}

function CinematicHeader({
  hero,
  step,
}: {
  hero: boolean;
  step: ReturnType<typeof useWizard.getState>["step"];
}) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30"
    >
      {/* animated top hairline */}
      <motion.div
        className="h-px origin-left bg-gradient-to-r from-transparent via-[#aa854c] to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
      <div className="border-b border-[#dbc9a8] bg-[#f6efe3]/90 shadow-[0_8px_30px_-22px_rgba(76,52,19,.4)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:h-20 sm:px-8">
          <Logo />

          {hero ? (
            <div className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a674b] sm:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-peach-deep" />
              </span>
              Endomax Lift · Personal guide
            </div>
          ) : (
            <ProgressRail step={step} />
          )}
        </div>
      </div>
    </motion.header>
  );
}
