"use client";

import { useRef, useState } from "react";
import { Camera, Upload, Lock } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/button";
import { ConsentCheckbox } from "@/components/compliance/ConsentCheckbox";
import { DisclaimerBanner } from "@/components/compliance/DisclaimerBanner";
import { CameraCapture } from "@/components/scan/CameraCapture";
import { PhotoGuide } from "@/components/scan/PhotoGuide";
import { useWizard, type MediaType } from "@/store/wizard-store";
import { fileToDownscaledImage } from "@/lib/image";

export function ConsentCaptureScreen() {
  const imageConsent = useWizard((s) => s.imageConsent);
  const setImageConsent = useWizard((s) => s.setImageConsent);
  const setImage = useWizard((s) => s.setImage);
  const beginScan = useWizard((s) => s.beginScan);

  const [mode, setMode] = useState<"choose" | "camera">("choose");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleCapture(base64: string, mediaType: MediaType) {
    setImage(base64, mediaType);
    beginScan();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      input.value = "";
      return;
    }
    try {
      // Downscale + re-encode before storing. A full-resolution phone photo held
      // raw in memory can crash/reload the tab on mobile (which resets the wizard
      // back to the start) — this keeps it small and upright.
      const { base64, mediaType } = await fileToDownscaledImage(file);
      setImage(base64, mediaType);
      beginScan();
    } catch {
      setError("Sorry, we couldn't read that image. Please try another photo.");
    } finally {
      // Allow re-selecting the same file (onChange won't fire otherwise).
      input.value = "";
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[.8fr_1.2fr] md:items-start md:gap-12 md:py-16">
      <Reveal className="md:sticky md:top-28">
        <p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#9a773e]">01 / Your photograph</p>
        <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.2rem)] leading-[1.05] !text-[#302719]">A thoughtful<br /><em className="font-normal text-[#9a773e]">first look.</em></h2>
        <p className="mt-5 max-w-md text-sm leading-[1.8] text-[#645746]">A clear selfie helps us prepare a personal guide to areas you may wish to discuss with Dr Ayda.</p>
        <div className="relative mt-7 hidden aspect-[4/3] overflow-hidden rounded-[2rem] border border-[#d2bf99] shadow-[0_20px_50px_-30px_rgba(84,58,17,.5)] md:block"><Image src="/visuals/gold-face-contour.png" alt="" fill sizes="400px" className="object-cover object-[center_34%]" /></div>
      </Reveal>
      <Reveal delay={.1} className="rounded-[2rem] border border-[#d8c7a8] bg-[#fffaf1]/90 p-5 shadow-[0_28px_70px_-45px_rgba(93,64,23,.5)] sm:p-8">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.17em] text-[#9a773e]"><Camera size={15} /> Your required selfie</div>
        <p className="mt-3 text-sm leading-relaxed text-[#645746]">Use your camera or upload a recent photo. Face forward in even light, with your jawline and neck visible.</p>

      {mode === "camera" ? (
        <div className="mt-6">
          <CameraCapture
            onCapture={handleCapture}
            onError={(m) => {
              setError(m);
              setMode("choose");
            }}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <PhotoGuide />

          <ConsentCheckbox checked={imageConsent} onChange={setImageConsent}>
            <span>
              <Lock size={13} className="mr-1 inline text-[#9a773e]" />I consent
              to my photo being analysed and included in my personalised report.
              The report may be emailed to me and stored securely by Harley Street
              Aesthetics for my consultation.
            </span>
          </ConsentCheckbox>

          {error && (
            <p className="rounded-xl border border-[#bd9762] bg-[#f5e6cb] px-4 py-3 text-sm text-[#523a20]">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              disabled={!imageConsent}
              onClick={() => setMode("camera")}
            >
              <Camera size={18} /> Use camera
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={!imageConsent}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={18} /> Upload photo
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleUpload}
            />
          </div>

          <DisclaimerBanner className="mt-2" />
        </div>
      )}
      </Reveal>
    </div>
  );
}
