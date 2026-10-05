import { Phone, Mail, MessageCircle } from "lucide-react";
import { CLINIC, DISCLAIMER } from "@/lib/constants";
import { Logo } from "./Logo";

export function ClinicFooter() {
  return (
    <footer className="relative mt-auto border-t border-[#d8c59f] bg-[#eee2cb] px-6 pb-8 pt-10 text-[#51432f] sm:pt-12">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a98143] to-transparent" />
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.25fr_1fr_1fr] md:gap-12">
        <div>
          <Logo withByline />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#6b5b43]">A considered approach to aesthetic care in London and Glasgow.</p>
        </div>
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[.2em] !text-[#98733c]">Our clinics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            {CLINIC.locations.map((loc) => <div key={loc.city}><p className="font-serif text-base text-[#34291c]">{loc.city}</p><p className="mt-1 text-xs leading-relaxed text-[#6b5b43]">{loc.lines.join(", ")}</p></div>)}
          </div>
        </div>
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[.2em] !text-[#98733c]">Get in touch</h2>
          <div className="mt-4 space-y-3 text-sm">
            <a href={CLINIC.phoneHref} className="flex items-center gap-2 hover:text-[#997239]"><Phone size={15} /> {CLINIC.phone}</a>
            <a href={CLINIC.whatsappHref} className="flex items-center gap-2 hover:text-[#997239]"><MessageCircle size={15} /> WhatsApp {CLINIC.whatsapp}</a>
            <a href={`mailto:${CLINIC.email}`} className="flex items-center gap-2 break-all hover:text-[#997239]"><Mail size={15} className="shrink-0" /> {CLINIC.email}</a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-[#cdb991] pt-5 text-[11px] leading-relaxed text-[#766750] sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-3xl">{DISCLAIMER}</p>
        <p className="shrink-0">© {new Date().getFullYear()} Harley Street Aesthetics</p>
      </div>
    </footer>
  );
}
