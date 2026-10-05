import type { AnalyzeResult } from "@/lib/types";
import { FIT_LABEL, lowerFaceProfile, type EndoliftFit, type ProfileEntry } from "@/lib/lower-face-profile";

const FIT_STYLE: Record<EndoliftFit, string> = {
  strong: "border-[#b8923f] bg-[#f3e4c2] text-[#5e4214]",
  good: "border-[#cdb07a] bg-[#f6ecd6] text-[#6a4d1e]",
  partial: "border-[#d4c3a3] bg-[#f7f0e2] text-[#6f5a37]",
  review: "border-[#d4c3a3] bg-[#f7f0e2] text-[#6f5a37]",
};

function Card({ label, entry }: { label: string; entry: ProfileEntry }) {
  return (
    <article className="rounded-2xl border border-[#d8c5a1] bg-[#fffcf5] p-5 shadow-[0_12px_35px_-28px_rgba(65,44,18,.35)] sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8a682f]">{label}</p>
      <p className="mt-2 text-xs text-[#6f5d42]">Your photo appears most consistent with</p>
      <h3 className="mt-1 font-serif text-2xl leading-tight !text-[#302719]">{entry.name}</h3>
      <p className="mt-0.5 text-sm text-[#8a682f]">Often called {entry.commonName}</p>
      <span className={`mt-3 inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${FIT_STYLE[entry.fit]}`}>
        {FIT_LABEL[entry.fit]}
      </span>
      <dl className="mt-4 space-y-3 text-sm leading-relaxed text-[#514534]">
        <div><dt className="text-xs font-bold !text-[#75541e]">What it is</dt><dd className="mt-1">{entry.what}</dd></div>
        <div><dt className="text-xs font-bold !text-[#75541e]">Why it happens</dt><dd className="mt-1">{entry.why}</dd></div>
      </dl>
      <div className="mt-4 rounded-xl bg-[#f4ebda] p-3.5">
        <h4 className="text-xs font-bold !text-[#624719]">How Endomax Lift helps</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-[#514534]">{entry.howItHelps}</p>
      </div>
    </article>
  );
}

/**
 * Opens the report: the TYPE of jowl and neck change the photo appears
 * consistent with, and how the Endomax Lift relates to each — before the
 * detailed area observations below.
 */
export function LowerFaceProfile({ result }: { result: AnalyzeResult }) {
  const { jowls, neck } = lowerFaceProfile(result);
  if (!jowls && !neck) return null;
  return (
    <section aria-labelledby="lower-face-profile" className="mb-8">
      <p className="text-[10px] font-bold uppercase tracking-[.23em] text-[#95743d]">Your lower-face profile</p>
      <h2 id="lower-face-profile" className="mt-2 font-serif text-3xl !text-[#302719]">What your jawline and neck show</h2>
      <div className={`mt-5 grid gap-5 ${jowls && neck ? "md:grid-cols-2" : ""}`}>
        {jowls && <Card label="Jawline & jowls" entry={jowls} />}
        {neck && <Card label="Neck & under-chin" entry={neck} />}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#786954]">
        A visual guide from one photo — Dr Ayda confirms the type, and whether skin, fat or muscle is responsible, at your consultation.
      </p>
    </section>
  );
}
