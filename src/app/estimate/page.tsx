import { createClient } from "@/lib/supabase/server";
import type { RegionalCostData } from "@/lib/supabase/types";
import { Estimator } from "./estimator";

export default async function EstimatePage() {
  const supabase = await createClient();
  const { data: regionalData } = await supabase
    .from("regional_cost_data")
    .select("*")
    .returns<RegionalCostData[]>();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl text-center">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Free &middot; No account needed
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-forest sm:text-5xl">
          What will your wedding cost?
        </h1>
        <p className="mt-4 text-base text-ink/80">
          Pick your state, guest count, and style to get an instant estimate, built from real
          wedding cost data across the country.
        </p>
      </div>

      <div className="mt-10 w-full max-w-2xl">
        <Estimator regionalData={regionalData ?? []} />
      </div>
    </main>
  );
}
