"use client";

import { useState } from "react";
import { PoundSterling } from "lucide-react";
import { OFFER } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Illustrative 0% finance calculator. HSA advertises 0% finance (see
// TRUST_MARKERS), so the illustration is a simple interest-free split of the
// treatment cost across the chosen term. Eligibility, terms and the finance
// provider's details are confirmed at consultation — the small print below
// keeps every figure clearly illustrative.
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
    <div className="rounded-2xl border border-peach/20 bg-white/[0.04] p-6 shadow-soft sm:p-8">
      <div className="flex items-center gap-2">
        <PoundSterling size={16} className="text-peach" />
        <h3 className="font-serif text-xl text-heading">
          Spread the cost with 0% finance
        </h3>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-body/80">
        Pay for your Endomax Lift in interest-free monthly instalments. Move
        the slider to see an illustrative plan for your treatment.
      </p>

      {/* Treatment cost slider */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="finance-amount"
            className="text-sm font-medium text-heading"
          >
            Treatment cost
          </label>
          <span className="font-serif text-2xl text-heading">
            {gbp0.format(amount)}
          </span>
        </div>
        <input
          id="finance-amount"
          type="range"
          min={500}
          max={4000}
          step={50}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-cream-deep accent-peach"
        />
        <div className="mt-1 flex justify-between text-[11px] text-body/60">
          <span>£500</span>
          <span>Endomax Lift from {gbp0.format(OFFER.price)}</span>
          <span>£4,000</span>
        </div>
      </div>

      {/* Term selector */}
      <div className="mt-6">
        <p className="text-sm font-medium text-heading">Repay over</p>
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
                  ? "border-peach bg-peach font-semibold text-ink shadow-glow"
                  : "border-peach/25 bg-transparent text-heading hover:bg-peach/10",
              )}
            >
              {t} mo
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 rounded-xl bg-white/[0.05] p-5 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-body/70">
          Illustrative monthly payment
        </p>
        <p className="mt-1 font-serif text-4xl text-heading">
          {gbp.format(monthly)}
          <span className="text-base text-body/70"> /month</span>
        </p>
        <p className="mt-2 text-[12px] text-body/70">
          {months} interest-free payments · total {gbp.format(amount)} · cost
          of credit £0.00
        </p>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-body/60">
        Illustration only — 0% APR representative, subject to status and
        lender approval. 18+, UK residents. Your finance options, eligibility
        and exact treatment price are confirmed at your free consultation.
      </p>
    </div>
  );
}
