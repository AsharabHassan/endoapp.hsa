import type { AnalyzeResult } from "@/lib/types";
import { focusExplanations } from "@/lib/focus-findings";

export function FocusReasons({ result }: { result: AnalyzeResult }) {
  const explanations = focusExplanations(result);
  if (!explanations.length) return null;
  return <div className="space-y-4">
    {explanations.map(({ finding, area, pattern, observation, mechanism, expectedChange }, index) => (
      <article key={finding} className="rounded-2xl border border-[#d8c5a1] bg-[#fffcf5] p-5 shadow-[0_12px_35px_-28px_rgba(65,44,18,.35)] sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#efe1c2] text-xs font-bold text-[#72511f]">0{index + 1}</span>
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8a682f]">{area}</p><h2 className="mt-1 font-serif text-xl !text-[#302719]">{pattern}</h2></div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#514534]">{observation}</p>
        <div className="mt-4 border-t border-[#e7dbc3] pt-4">
          <h3 className="text-xs font-bold !text-[#75541e]">How Endomax Lift may help</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[#514534]">{mechanism}</p>
        </div>
        <div className="mt-4 rounded-xl bg-[#f4ebda] p-3.5">
          <h3 className="text-xs font-bold !text-[#624719]">The change to aim for</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[#514534]">{expectedChange}</p>
        </div>
      </article>
    ))}
  </div>;
}
