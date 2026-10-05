import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarHeart,
  MapPin,
  ScanFace,
  Star,
  Stethoscope,
  PoundSterling,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ClinicFooter } from "@/components/brand/ClinicFooter";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Button } from "@/components/ui/button";
import { ResultsGallery } from "@/components/result/ResultsGallery";
import { Testimonials } from "@/components/result/Testimonials";
import { OfferHero } from "@/components/offer/OfferHero";
import { FinanceCalculator } from "@/components/offer/FinanceCalculator";
import { BookingCalendar } from "@/components/offer/BookingCalendar";
import { InstagramReel } from "@/components/offer/InstagramReel";
import { CLINIC, OFFER } from "@/lib/constants";

export const metadata: Metadata = {
  title:
    "Endomax Lift packages from £2,000 · Free online consultation · Harley Street Aesthetics",
  description:
    "Endomax Lift packages from £2,000 at Harley Street Aesthetics. Explore payment options and book a free online consultation with Dr Ayda.",
  // Ad retargeting landing page — keep it out of search results.
  robots: { index: false, follow: false },
};

// Expanded trust factors for the retargeting page — same claims as the
// site-wide TRUST_MARKERS, with a line of supporting copy each.
const TRUST_CARDS = [
  {
    icon: MapPin,
    title: "10 Harley Street, London & Glasgow",
    copy: "Two flagship clinics: the heart of London's medical district, and Ingram Street in Glasgow's Merchant City.",
  },
  {
    icon: Stethoscope,
    title: "Doctor-led & medically supervised",
    copy: "Every Endomax Lift is delivered under the supervision of our Harley Street medical team.",
  },
  {
    icon: Star,
    title: "Rated excellent by patients",
    copy: "Consistently rated excellent in independent patient reviews across both clinics.",
  },
  {
    icon: PoundSterling,
    title: "0% finance & a free consultation",
    copy: "Spread the cost interest-free, and take your time to decide — the consultation is free and no-pressure.",
  },
] as const;

export default function OfferPage() {
  return (
    <div className="journey-light flex min-h-dvh flex-col">
      <AmbientBackground tone="warm" />

      {/* Sticky header: brand + the one action that matters */}
      <header className="sticky top-0 z-40 border-b border-[#d8c7a8] bg-[#f6efe3]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Logo />
          <a href="#book">
            <Button size="md">
              <CalendarHeart size={16} />
              <span className="sm:hidden">Book now</span>
              <span className="max-sm:hidden">Book free consultation</span>
            </Button>
          </a>
        </div>
      </header>

      <main className="flex-1">
        <OfferHero />

        {/* Trust factors */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif text-2xl text-heading">
              Why patients choose {CLINIC.name}
            </h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {TRUST_CARDS.map(({ icon: Icon, title, copy }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-2xl border border-[#d8c7a8] bg-[#fffaf1] p-5 shadow-[0_20px_40px_-30px_rgba(87,57,15,.45)]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-peach/15 text-peach">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="font-serif text-base text-heading">
                      {title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-body">
                      {copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Before / after */}
        <section className="report-dark bg-[#3a3026] px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <ResultsGallery />
          </div>
        </section>

        {/* Social proof: video testimonial (when configured) + written reviews */}
        <section className="report-dark bg-[#3a3026] px-6 py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif text-2xl text-heading">
              Hear it from our patients
            </h2>
            {OFFER.instagramReelUrl ? (
              <div className="mt-8 grid items-start gap-10 lg:grid-cols-[340px_1fr]">
                <InstagramReel />
                <Testimonials />
              </div>
            ) : (
              <div className="mt-8">
                <Testimonials />
              </div>
            )}
          </div>
        </section>

        {/* Offer recap + finance */}
        <section id="finance" className="px-6 py-14">
          <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="inline-flex rounded-full border border-peach/40 bg-peach/10 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-peach">
                Treatment and payment options
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-snug text-heading">
                Endomax Lift packages from £2,000
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-body">
                Explore monthly payments with the calculator. Dr Ayda will
                discuss your goals in a free online consultation; the clinic
                will confirm the treatment plan and final quote afterward.
              </p>
              <a href="#book" className="mt-6 inline-block">
                <Button size="lg">
                  <CalendarHeart size={18} /> Book your online consultation
                </Button>
              </a>
            </div>
            <FinanceCalculator />
          </div>
        </section>

        {/* Booking */}
        <section id="book" className="scroll-mt-20 px-6 py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-serif text-2xl text-heading">
              Book your free online consultation
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm text-body/80">
              A free 15-minute online conversation with Dr Ayda about your
              guide and goals. The clinic will confirm the next step and your
              treatment quote after the consultation.
            </p>
            <div className="mt-7">
              <BookingCalendar />
            </div>
          </div>
        </section>

        {/* Secondary path: retake the AI scan */}
        <section className="px-6 pb-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-[#d8c7a8] bg-[#fffaf1] px-6 py-8 text-center">
            <ScanFace size={26} className="text-peach" />
            <h2 className="font-serif text-xl text-heading">
              Not sure the Endomax Lift is right for you?
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-body">
              Take the free 60-second AI suitability scan (again, if you like)
              — a selfie and a few questions, and you&apos;ll get a personal
              suitability guide before you book.
            </p>
            <Link href="/">
              <Button variant="outline" size="md">
                <ScanFace size={16} /> Take the AI scan
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <ClinicFooter />
    </div>
  );
}

