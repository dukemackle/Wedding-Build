"use client";

import { CANCELLATION_POLICY_MAX, REPLY_TIMES, type BusinessFacts, type ReplyTime } from "@/lib/business-facts";
import { Field, inputClass, Section } from "./form-parts";

/**
 * "Booking and policies" on both claim forms: the facts couples otherwise
 * email to ask. Every box is optional. `children` holds the venue-only rules.
 */
export function BookingFactsSection({
  facts,
  onChange,
  children,
}: {
  facts: BusinessFacts;
  onChange: (patch: Partial<BusinessFacts>) => void;
  children?: React.ReactNode;
}) {
  const number = (key: "founded_year" | "weddings_per_year" | "booking_lead_months" | "deposit_percent" | "balance_due_days") =>
    ({
      type: "number",
      inputMode: "numeric",
      min: 0,
      value: facts[key] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value ? Number(e.target.value) : null }),
      className: inputClass,
    }) as const;

  return (
    <Section
      title="Booking and policies"
      hint="Optional. Couples ask these before almost anything else, and they show on your listing."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Year you started">
          <input {...number("founded_year")} min={1800} max={new Date().getFullYear()} placeholder="2014" />
        </Field>
        <Field label="Weddings a year (roughly)">
          <input {...number("weddings_per_year")} placeholder="40" />
        </Field>
        <Field label="Booked ahead (months)">
          <input {...number("booking_lead_months")} max={48} placeholder="12" />
        </Field>
        <Field label="You usually reply">
          <select
            value={facts.reply_time ?? ""}
            onChange={(e) => onChange({ reply_time: (e.target.value || null) as ReplyTime | null })}
            className={inputClass}
          >
            <option value="">Pick one</option>
            {Object.entries(REPLY_TIMES).map(([key, label]) => (
              <option key={key} value={key}>
                {label[0].toUpperCase() + label.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Deposit to book (%)">
          <input {...number("deposit_percent")} max={100} placeholder="30" />
        </Field>
        <Field label="Balance due (days before)">
          <input {...number("balance_due_days")} max={365} placeholder="14 · 0 if on the day" />
        </Field>
        {children}
        <Field label="Cancellation or postponement policy" className="sm:col-span-2">
          <textarea
            rows={2}
            maxLength={CANCELLATION_POLICY_MAX}
            value={facts.cancellation_policy ?? ""}
            onChange={(e) => onChange({ cancellation_policy: e.target.value || null })}
            className={inputClass}
            placeholder="Deposit is non-refundable; one free date change up to 6 months out."
          />
        </Field>
      </div>
    </Section>
  );
}
