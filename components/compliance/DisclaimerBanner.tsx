import { Info } from "lucide-react";
import { DISCLAIMER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function DisclaimerBanner({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-2xl border border-[#d8c7a8] bg-[#f0e6d4] px-4 py-3 text-xs leading-relaxed text-[#655746]",
        className,
      )}
    >
      <Info size={14} className="mt-0.5 shrink-0 text-[#9a773e]" />
      <span>{DISCLAIMER}</span>
    </p>
  );
}
