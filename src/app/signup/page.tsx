import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rounded-lg border border-hairline bg-card p-10 shadow-sm">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Get started
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
          Create your account
        </h1>

        {error && (
          <p className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <form className="mt-6 flex flex-col gap-4" action={signup}>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Password
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Sign up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/70">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brass hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
