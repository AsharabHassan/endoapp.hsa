"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useLightFx } from "@/lib/use-light-fx";

/** Decorative artwork only. Pointer movement never affects the patient's photo. */
export function ContourArtwork({ priority = false }: { priority?: boolean }) {
  const light = useLightFx();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(y, { stiffness: 65, damping: 22 });
  const rotateY = useSpring(x, { stiffness: 65, damping: 22 });

  return (
    <div
      aria-hidden="true"
      className="contour-scene relative mx-auto w-full max-w-[410px] p-5 sm:p-7"
      onPointerMove={(event) => {
        if (light) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 8);
        y.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -6);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      <div className="pointer-events-none absolute inset-x-0 inset-y-10 rounded-[50%] border border-[#ad8950]/35 -rotate-12" />
      <motion.div
        style={light ? undefined : { rotateX, rotateY }}
        className="relative aspect-[4/5] rounded-t-[48%] rounded-b-[2rem] shadow-[0_35px_70px_-28px_rgba(92,62,26,.42)]"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[inherit] border border-[#b99a65]/60 bg-[#e8dac1]">
          <Image src="/visuals/gold-face-contour.png" alt="" fill priority={priority} sizes="(max-width: 767px) 260px, 410px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#785326]/15 via-transparent to-white/10" />
          {!light && <div className="contour-light pointer-events-none absolute -inset-y-1/2 -left-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />}
        </div>
        <div className="absolute inset-3 rounded-[inherit] border border-white/45" />
      </motion.div>
      <span className="absolute bottom-8 right-0 h-14 w-14 rounded-full border border-[#ae8c50]/45 bg-[#fcf5e8]/75 shadow-lg backdrop-blur-md sm:h-20 sm:w-20">
        <svg viewBox="0 0 80 80" className="h-full w-full fill-none stroke-[#ad8950]" strokeWidth="0.8"><path d="M40 14v52M14 40h52M22 22l36 36M22 58l36-36"/><circle cx="40" cy="40" r="17"/></svg>
      </span>
    </div>
  );
}
