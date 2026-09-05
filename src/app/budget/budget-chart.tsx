const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export type BudgetChartItem = {
  key: string;
  label: string;
  amount: number;
};

function BudgetQuoteMeter({ quoted, total }: { quoted: number; total: number }) {
  const pct = total > 0 ? (quoted / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-ink/70">Categories with a real quote</span>
        <span className="font-mono-numbers text-sm text-ink">
          {quoted} of {total}
        </span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-forest/10">
        <div
          className="h-3 rounded-full bg-forest transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function BudgetBarChart({ items }: { items: BudgetChartItem[] }) {
  const sorted = [...items].sort((a, b) => b.amount - a.amount);
  const max = Math.max(...sorted.map((item) => item.amount), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map((item) => {
        const widthPct = (item.amount / max) * 100;
        return (
          <div key={item.key} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs text-ink/70 sm:w-36">
              {item.label}
            </span>
            <div className="h-5 flex-1 rounded-sm bg-forest/10">
              <div
                className="h-5 rounded-r-[4px] bg-forest transition-[width]"
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right font-mono-numbers text-xs text-ink sm:w-20">
              {currency.format(item.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function BudgetOverview({
  items,
  quoted,
  total,
}: {
  items: BudgetChartItem[];
  quoted: number;
  total: number;
}) {
  return (
    <div className="mt-6 w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <span className="font-display text-2xl font-semibold text-forest">
        Spending breakdown
      </span>
      <p className="mt-1 text-sm text-ink/70">
        Where your estimated budget is going, highest to lowest.
      </p>

      <div className="mt-6">
        <BudgetQuoteMeter quoted={quoted} total={total} />
      </div>

      <div className="mt-6 border-t border-hairline pt-6">
        <BudgetBarChart items={items} />
      </div>
    </div>
  );
}
