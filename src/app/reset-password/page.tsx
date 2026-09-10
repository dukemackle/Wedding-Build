import { updatePassword } from "./actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Set a new password
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
          Reset password
        </h1>

        {error && (
          <p className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <form className="mt-6 flex flex-col gap-4" action={updatePassword}>
          <label className="flex flex-col gap-1 text-sm text-ink">
            New password
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Confirm new password
            <input
              type="password"
              name="confirm_password"
              required
              minLength={6}
              className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
