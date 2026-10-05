import type { Bucket } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Clinic brand + contact constants (Harley Street Aesthetics, London & Glasgow).
// Single source of truth for copy that appears across screens.
// ─────────────────────────────────────────────────────────────────────────────

export interface ClinicLocation {
  city: string;
  lines: string[];
  phone: string;
  phoneHref: string;
}

export const CLINIC = {
  name: "Harley Street Aesthetics",
  shortName: "HSA",
  byline: "London · Glasgow",
  director: "Our Harley Street medical team",
  tagline:
    "London & Glasgow's premier destination for advanced aesthetic medicine",
  // Primary (London flagship) — used wherever a single address is shown.
  addressLines: ["10 Harley Street", "London W1G 9PF"],
  phone: "020 4628 3165",
  phoneHref: "tel:+442046283165",
  whatsapp: "07700 106236",
  whatsappHref: "https://wa.me/447700106236",
  email: "hello@harleystreetaesthetic.co.uk",
  hours: "Mon–Sat · by appointment",
  locations: [
    {
      city: "London",
      lines: ["10 Harley Street", "London W1G 9PF"],
      phone: "020 4628 3165",
      phoneHref: "tel:+442046283165",
    },
    {
      city: "Glasgow",
      lines: ["5th Floor, Ingram House", "227 Ingram Street, Glasgow G1 1DA"],
      phone: "0141 488 8985",
      phoneHref: "tel:+441414888985",
    },
  ] satisfies ClinicLocation[],
} as const;

/** Profile facts and portrait are from the clinic's London team page. */
export const CONSULTANT = {
  name: "Dr Ayda Soltanzadeh",
  role: "Consultant Dermatologist",
  profile:
    "Dr Ayda brings a clinical dermatology background and a considered approach to facial aesthetics. Your free online consultation is the place to discuss your photo guide, goals and next steps.",
  image: "/images/dr-ayda-soltanzadeh.webp",
  profileUrl: "https://harleystreetaesthetic.co.uk/london/team",
} as const;

export const TRUST_MARKERS = [
  "10 Harley Street, London",
  "Doctor-led & medically supervised",
  "Rated excellent by patients",
  "0% finance available",
] as const;

/** Booking + site URLs (overridable via public env at deploy). */
export const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ??
  process.env.NEXT_PUBLIC_PHOREST_BOOKING_URL ??
  "https://harleystreetaesthetic.co.uk/london/book";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://endomax.harleystreetaesthetic.co.uk";

/** Meta (Facebook) Pixel ID. Empty disables all pixel tracking. */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

// ─────────────────────────────────────────────────────────────────────────────
// Per-bucket presentation metadata. The scoring engine chooses the bucket; this
// drives the result screen's headline, tone colour, gauge band and CTA.
// ─────────────────────────────────────────────────────────────────────────────

export interface BucketMeta {
  label: string;
  /** Default headline used by the deterministic fallback narrative. */
  headline: string;
  /** Encouraging sub-line. */
  blurb: string;
  /** Brand token used to theme the verdict (CSS var name without `--color-`). */
  accent: "peach" | "sage";
  ctaLabel: string;
  /** Indicative gauge band centre for this bucket (0–100). */
  gaugeBand: [number, number];
}

export const BUCKET_META: Record<Bucket, BucketMeta> = {
  great: {
    label: "Strong candidate",
    headline: "The Endomax Lift looks like a strong fit for you",
    blurb:
      "Your answers point to exactly the kind of early-to-moderate laxity the Endomax Lift addresses beautifully.",
    accent: "peach",
    ctaLabel: "Book your free consultation",
    gaugeBand: [82, 100],
  },
  good: {
    label: "Good candidate",
    headline: "The Endomax Lift could work well for you",
    blurb:
      "You show many of the signs that respond well to the Endomax Lift — a consultation will confirm the detail.",
    accent: "peach",
    ctaLabel: "Book your free consultation",
    gaugeBand: [68, 88],
  },
  consultation: {
    label: "Consultation recommended",
    headline: "The Endomax Lift may help — let's confirm in person",
    blurb:
      "A few of your answers are best reviewed by our Harley Street team before we can be sure. That's completely normal.",
    accent: "sage",
    ctaLabel: "Book your free consultation",
    gaugeBand: [55, 75],
  },
  alternative: {
    label: "Let's explore your options",
    headline: "Another treatment may suit you better",
    blurb:
      "Your goals may be better met by a different approach. A free consultation is the best way to find the right one.",
    accent: "sage",
    ctaLabel: "Discuss your options",
    gaugeBand: [40, 60],
  },
};

/** Friendly labels for the areas a respondent can select. */
export const AREA_LABELS: Record<string, string> = {
  jawline: "jawline & jowls",
  chin: "under-chin",
  neck: "neck",
  cheeks: "mid-face & cheeks",
  undereye: "under-eye area",
  body: "body area",
};

/** Areas the Endomax Lift targets, for the result screen's "what it treats" context. */
export const ENDOLIFT_AREAS = [
  "Jawline & jowls",
  "Under-chin / double chin",
  "Neck",
  "Mid-face & cheeks",
] as const;

/** Clinic-specified Endomax Lift package starting price. */
export const PRICE_GUIDE = {
  from: "£2,000",
  note: "Package price starts here. Your treatment plan and final quote are confirmed after consultation. 0% finance options are available, subject to terms.",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Offer page (/offer): package pricing, booking, social proof and payment planning.
// ─────────────────────────────────────────────────────────────────────────────

export const OFFER = {
  /** Package starting price in GBP (numeric, used by the calculator). */
  price: 2000,
  /**
   * GoHighLevel booking-calendar widget URL to embed on the offer page.
   * PLACEHOLDER: HSA has no calendar widget configured yet — while this is
   * empty the page shows a booking panel (phone / WhatsApp / booking site)
   * instead of an embedded calendar. Set NEXT_PUBLIC_OFFER_CALENDAR_URL to a
   * GHL widget URL (links.…/widget/bookings/…) to enable the in-page calendar.
   */
  calendarUrl: process.env.NEXT_PUBLIC_OFFER_CALENDAR_URL ?? "",
  /**
   * Instagram reel with an HSA patient's Endomax Lift testimonial.
   * PLACEHOLDER: empty until HSA provides their own reel — the video card is
   * hidden while unset. Do not reuse another clinic's patient content.
   */
  instagramReelUrl: "" as string,
} as const;

export const DISCLAIMER =
  "This tool offers general information to help you prepare for a consultation. It is not a medical assessment or diagnosis. Suitability for the Endomax Lift is confirmed in person by a qualified practitioner.";
