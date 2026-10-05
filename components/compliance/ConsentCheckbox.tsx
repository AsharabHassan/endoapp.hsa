"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Explicit, unchecked-by-default consent control. Used independently for the
 * face-image-processing consent and the (separate) marketing consent so neither
 * is bundled with the other.
 */
export function ConsentCheckbox({
  checked,
  onChange,
  children,
  className,
}: ConsentCheckboxProps) {
  const id = React.useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
        checked
          ? "border-[#a98543] bg-[#f2e4c9]"
          : "border-[#d9c8a7] bg-[#fffaf0] hover:border-[#af8e57]",
        className,
      )}
    >
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md border transition",
            checked
              ? "border-[#a98543] bg-[#b79351] text-[#241b11]"
              : "border-[#b9a580] bg-white",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-peach-deep peer-focus-visible:ring-offset-1",
          )}
        >
          {checked && <Check size={14} strokeWidth={3} />}
        </span>
      </span>
      <span className="text-sm leading-relaxed text-[#5d5040]">{children}</span>
    </label>
  );
}
