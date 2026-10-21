"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Step =
  | { kind: "loading" }
  | { kind: "setup"; factorId: string; qr: string; secret: string }
  | { kind: "code"; factorId: string }
  | { kind: "failed"; message: string };

const FRIENDLY_NAME = "You Do, I Do admin";

export function MfaStep() {
  const [step, setStep] = useState<Step>({ kind: "loading" });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const router = useRouter();
  // Setting up creates a factor; running twice (React's dev double effect)
  // would race two enrolments against each other.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) return setStep({ kind: "failed", message: error.message });

      const verified = data.totp[0];
      if (verified) return setStep({ kind: "code", factorId: verified.id });

      // A setup abandoned halfway leaves an unverified factor behind, and a
      // second one with the same name is refused -- clear it and start again.
      for (const factor of data.all) {
        if (factor.factor_type === "totp" && factor.status === "unverified") {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }
      const enrolled = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: FRIENDLY_NAME });
      if (enrolled.error) return setStep({ kind: "failed", message: enrolled.error.message });
      setStep({
        kind: "setup",
        factorId: enrolled.data.id,
        qr: enrolled.data.totp.qr_code,
        secret: enrolled.data.totp.secret,
      });
    })();
  }, []);

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    if (step.kind !== "setup" && step.kind !== "code") return;
    setChecking(true);
    setError(null);
    const { error } = await createClient().auth.mfa.challengeAndVerify({
      factorId: step.factorId,
      code: code.trim(),
    });
    if (error) {
      setChecking(false);
      setError("That code didn't match. Codes change every 30 seconds, so try the current one.");
      return;
    }
    // The browser client has stored the upgraded session cookie, so the
    // server sees the second step on this navigation.
    router.replace("/admin");
  }

  if (step.kind === "loading") {
    return <p className="mt-4 text-sm text-ink/60">Checking your sign-in&hellip;</p>;
  }

  if (step.kind === "failed") {
    return (
      <p className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
        Couldn&apos;t start the authenticator step: {step.message}
      </p>
    );
  }

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={verify}>
      {step.kind === "setup" ? (
        <>
          <p className="text-sm leading-relaxed text-ink/70">
            The admin panel needs a code from an authenticator app (Google Authenticator, 1Password, Authy
            and similar) as well as your password. Scan this once with the app:
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- an inline SVG data URL from Supabase */}
          <img src={step.qr} alt="QR code for your authenticator app" className="mx-auto h-44 w-44 rounded-md bg-white p-2" />
          <p className="text-xs text-ink/60">
            Can&apos;t scan? Enter this key in the app instead:{" "}
            <code className="break-all font-mono-numbers text-ink">{step.secret}</code>
          </p>
        </>
      ) : (
        <p className="text-sm leading-relaxed text-ink/70">Enter the 6-digit code from your authenticator app.</p>
      )}

      {error && (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}

      <label className="flex flex-col gap-1 text-sm text-ink">
        Code
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          className="rounded-md border border-hairline bg-parchment px-3 py-2 font-mono-numbers tracking-[0.3em] text-ink outline-none focus:border-forest"
        />
      </label>
      <button
        type="submit"
        disabled={checking || code.length !== 6}
        className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
      >
        {checking ? "Checking…" : step.kind === "setup" ? "Turn on and continue" : "Continue"}
      </button>
    </form>
  );
}
