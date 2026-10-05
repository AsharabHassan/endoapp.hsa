"use client";

import { useState } from "react";
import { PoundSterling } from "lucide-react";
import { OFFER } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Payment calculator using the clinic's starting package and advertised 0%
// finance options. The quote, provider and eligibility are confirmed separately.
// ─────────────────────────────────────────────────────────────────────────────

const TERMS = [3, 6, 9, 12] as const;

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const gbp0 = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function FinanceCalculator() {
  const [amount, setAmount] = useState<number>(OFFER.price);
  const [months, setMonths] = useState<number>(12);

  const monthly = amount / months;

  return (
    <div className="rounded-[1.75rem] border border-[#cdb682] bg-[#fffaf0] p-6 text-[#2e261d] shadow-[0_24px_80px_-42px_rgba(88,61,22,0.45)] sm:p-8">
      <div className="flex items-center gap-2">
        <PoundSterling size={16} className="text-[#9b792e]" />
        <h3 className="font-serif text-xl !text-[#2e261d]">
          Explore your payment plan
        </h3>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-[#65594b]">
        Endomax Lift packages start from £2,000. Adjust the amount and term to
        see the monthly split at 0% interest.
      </p>

      {/* Treatment cost slider */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="finance-amount"
            className="text-sm font-medium text-[#2e261d]"
          >
            Treatment cost
          </label>
          <span className="font-serif text-2xl text-[#2e261d]">
            {gbp0.format(amount)}
          </span>
        </div>
        <input
          id="finance-amount"
          type="range"
          min={OFFER.price}
          max={6000}
          step={50}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e9dcc4] accent-[#ad893e]"
        />
        <div className="mt-1 flex justify-between text-[11px] text-[#7d6d59]">
          <span>{gbp0.format(OFFER.price)}</span>
          <span>£6,000</span>
        </div>
      </div>

      {/* Term selector */}
      <div className="mt-6">
        <p className="text-sm font-medium text-[#2e261d]">Repay over</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {TERMS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMonths(t)}
              aria-pressed={months === t}
              className={cn(
                "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                months === t
                  ? "border-[#a98538] bg-[#b99449] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(120,87,30,0.7)]"
                  : "border-[#d5c3a3] bg-white/70 text-[#4c3c2a] hover:bg-[#f4ead6]",
              )}
            >
              {t} mo
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 rounded-xl border border-[#dfcba8] bg-[#f1e4ca] p-5 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#745d38]">
          Monthly payment estimate
        </p>
        <p className="mt-1 font-serif text-4xl text-[#2e261d]">
          {gbp.format(monthly)}
          <span className="text-base text-[#65594b]"> /month</span>
        </p>
        <p className="mt-2 text-[12px] text-[#65594b]">
          {months} interest-free payments · total {gbp.format(amount)} · cost
          of credit £0.00
        </p>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-[#746656]">
        0% finance options depend on the provider and approval. Your exact
        treatment quote, payment schedule and eligibility are confirmed before
        any finance agreement.
      </p>
    </div>
  );
}

