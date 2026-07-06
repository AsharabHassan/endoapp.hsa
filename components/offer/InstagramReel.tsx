"use client";

import { Play } from "lucide-react";
import { OFFER } from "@/lib/constants";

/**
 * An HSA patient's Endomax Lift video testimonial, embedded via Instagram's
 * public /embed endpoint (no SDK needed). Renders nothing until
 * OFFER.instagramReelUrl is set — populate it with HSA's own patient reel
 * only (never another clinic's content). If Instagram blocks the frame for a
 * visitor, the link below still opens the reel.
 */
export function InstagramReel() {
  if (!OFFER.instagramReelUrl) return null;

  const embedSrc = `${OFFER.instagramReelUrl.replace(/\/+$/, "")}/embed/`;

  return (
    <figure className="mx-auto w-full max-w-[340px]">
      <div className="overflow-hidden rounded-2xl border border-peach/20 bg-white shadow-soft">
        <iframe
          src={embedSrc}
          title="Harley Street Aesthetics patient Endomax Lift testimonial on Instagram"
          loading="lazy"
          allow="encrypted-media"
          className="block h-[560px] w-full border-0"
        />
      </div>
      <figcaption className="mt-3 text-center text-[13px] text-body/80">
        A Harley Street Aesthetics patient shares their Endomax Lift
        experience.{" "}
        <a
          href={OFFER.instagramReelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-peach transition hover:text-peach-light"
        >
          <Play size={13} /> Watch on Instagram
        </a>
      </figcaption>
    </figure>
  );
}
