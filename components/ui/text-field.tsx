"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

let idCounter = 0;

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, id, className, ...props }, ref) => {
    const reactId = React.useId();
    const fieldId = id ?? `tf-${reactId}-${idCounter++}`;
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={fieldId}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5b40]"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          className={cn(
            "h-12 rounded-2xl border border-[#d4c3a4] bg-[#fffdf8] px-4 text-[15px] text-[#302719]",
            "placeholder:text-[#9b8a70] outline-none transition",
            "focus:border-[#a98543] focus:ring-4 focus:ring-[#d7bc84]/25",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
TextField.displayName = "TextField";
