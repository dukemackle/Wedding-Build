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

export function paymentsFromRows(
  rows: BudgetRow[],
  customItems: { label: string; amount: number; due_date: string | null }[],
): UpcomingPayment[] {
  const fromCategories = rows
    .filter((row): row is BudgetRow & { dueDate: string } => Boolean(row.dueDate))
    .map((row) => ({
      key: row.key,
      label: row.label,
      amount: row.override ?? row.computed,
      dueDate: row.dueDate,
    }));

  const fromCustom = customItems
    .filter((item): item is typeof item & { due_date: string } => Boolean(item.due_date))
    .map((item, index) => ({
      key: `custom-${index}`,
      label: item.label,
      amount: item.amount,
      dueDate: item.due_date,
    }));

  return [...fromCategories, ...fromCustom].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function UpcomingPayments({ payments }: { payments: UpcomingPayment[] }) {
  if (payments.length === 0) return null;

  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <span className="font-display text-2xl font-semibold text-forest">Upcoming payments</span>
      <p className="mt-1 text-sm text-ink/70">
        Deposits and balances you&apos;ve given a due date, soonest first.
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
