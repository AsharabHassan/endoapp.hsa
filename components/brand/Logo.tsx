import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  tone?: "dark" | "light";
  withByline?: boolean;
  className?: string;
}

/** The clinic's own wordmark, sourced from its website. */
export function Logo({ tone = "dark", withByline = false, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className="relative block h-11 w-20 shrink-0 overflow-hidden sm:h-12 sm:w-24">
        <Image src="/images/hsa-logo.png" alt="Harley Street Aesthetics" fill sizes="(max-width: 640px) 80px, 96px" className="object-cover object-center" priority />
      </span>
      <span className={cn("border-l pl-3", tone === "light" ? "border-[#bda879] text-[#f9efd9]" : "border-[#bda879] text-[#44351f]")}> 
        <span className="block font-serif text-[13px] leading-none tracking-[.04em] sm:text-[15px]">Harley Street</span>
        <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[.22em] text-[#a47d39] sm:text-[10px]">Aesthetics</span>
        {withByline && <span className={cn("mt-1 block text-[9px] uppercase tracking-[.15em]", tone === "light" ? "text-[#d6c8a9]" : "text-[#7e6b4c]")}>London · Glasgow</span>}
      </span>
    </span>
  );
}
