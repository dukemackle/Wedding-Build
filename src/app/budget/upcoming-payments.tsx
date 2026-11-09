import type { BudgetRow } from "./budget-table";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatDueDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dateStr}T00:00:00`) < today;
}

export type UpcomingPayment = {
  key: string;
  label: string;
  amount: number;
  dueDate: string;
};

/**
 * What's still owed: cost minus anything already paid. A bill paid off (or
 * overpaid) drops out, so a settled deposit never sits here turning red.
 */
function stillOwed(cost: number, paid: number | null) {
  return Math.max(0, cost - (paid ?? 0));
}

export function paymentsFromRows(
  rows: BudgetRow[],
  customItems: { label: string; amount: number; paid_amount: number | null; due_date: string | null }[],
): UpcomingPayment[] {
  const fromCategories = rows
    .filter((row): row is BudgetRow & { dueDate: string } => Boolean(row.dueDate))
    .map((row) => {
      const cost = row.override ?? row.computed ?? 0;
      return {
        key: row.key,
        label: row.label,
        amount: stillOwed(cost, row.paidAmount),
        paidOff: cost > 0 && (row.paidAmount ?? 0) >= cost,
        dueDate: row.dueDate,
      };
    });

  const fromCustom = customItems
    .filter((item): item is typeof item & { due_date: string } => Boolean(item.due_date))
    .map((item, index) => ({
      key: `custom-${index}`,
      label: item.label,
      amount: stillOwed(item.amount, item.paid_amount),
      paidOff: item.amount > 0 && (item.paid_amount ?? 0) >= item.amount,
      dueDate: item.due_date,
    }));

  return [...fromCategories, ...fromCustom]
    .filter((payment) => !payment.paidOff)
    .map(({ key, label, amount, dueDate }) => ({ key, label, amount, dueDate }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function UpcomingPayments({ payments }: { payments: UpcomingPayment[] }) {
  if (payments.length === 0) return null;

  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <span className="font-display text-2xl font-semibold text-forest">Upcoming payments</span>
      <p className="mt-1 text-sm text-ink/70">
        What&apos;s still owed on anything with a due date, soonest first.
      </p>
      <div className="mt-4">
        {payments.map((payment) => (
          <div
            key={payment.key}
            className="flex items-center justify-between gap-4 border-b border-hairline py-3 last:border-b-0"
          >
            <span className="text-ink">{payment.label}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono-numbers text-ink">{currency.format(payment.amount)}</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs ${
                  isOverdue(payment.dueDate)
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-hairline text-ink/50"
                }`}
              >
                {isOverdue(payment.dueDate) ? "Overdue" : "Due"} {formatDueDate(payment.dueDate)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
