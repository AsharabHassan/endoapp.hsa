import { ArrowUpRight, Video } from "lucide-react";
import { CONSULTANT } from "@/lib/constants";

export function DoctorProfile() {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-[#d8c49f] bg-[#fffaf1] p-5 text-[#302719] shadow-[0_28px_65px_-44px_rgba(83,56,13,0.5)] sm:p-6">
      <div aria-hidden className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-[#d5b571]/20 blur-3xl" />
      <div className="relative flex items-start gap-4 sm:gap-5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#90713a]">Your consultation</p>
          <h3 className="mt-1 font-serif text-[22px] leading-tight !text-[#302719] sm:text-[26px]">
            {CONSULTANT.name}
          </h3>
          <p className="mt-1 text-xs font-medium text-[#746553]">{CONSULTANT.role}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6e5734]">
            <Video size={13} /> Free 15-minute online call · phone fallback
          </p>
        </div>
      </div>
      <p className="relative mt-4 text-[13px] leading-relaxed text-[#625545]">{CONSULTANT.profile}</p>
      <a
        href={CONSULTANT.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#896832] underline-offset-4 hover:underline"
      >
        Meet our medical team <ArrowUpRight size={13} />
      </a>
    </section>
  );
}

