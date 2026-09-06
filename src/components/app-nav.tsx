import { signOut } from "@/lib/supabase/actions";
import { WeddingAssistantWidget } from "@/components/wedding-assistant-widget";
import { NavLinks } from "@/components/nav-links";

export function AppNav({
  email,
  maxWidthClassName = "max-w-2xl",
}: {
  email: string;
  maxWidthClassName?: string;
}) {
  return (
    <div
      className={`mb-6 flex w-full ${maxWidthClassName} flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
    >
      <NavLinks />
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="truncate font-mono-numbers text-sm text-ink/60">{email}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="shrink-0 font-mono-numbers text-sm text-brass hover:underline"
          >
            Log out
          </button>
        </form>
      </div>
      <WeddingAssistantWidget />
    </div>
  );
}
