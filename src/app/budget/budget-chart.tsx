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

export function BudgetBarChart({ items }: { items: BudgetChartItem[] }) {
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
