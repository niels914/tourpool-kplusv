"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("E-mailadres of wachtwoord klopt niet.");
    } else {
      router.push("/klassement");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError("Kon geen reset-e-mail sturen. Controleer het e-mailadres.");
    } else {
      setResetSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl">
            <Image src="/kplusv-logo.jpg" alt="KplusV" width={64} height={64} className="rounded-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-[#111827]">KplusV Tourpool</h1>
          <p className="mt-1 text-[#6B7280]">Tour de France 2026</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#E2DFF0] bg-white p-8 shadow-sm">
          {resetSent ? (
            <div className="text-center">
              <div className="mb-4 text-4xl">📬</div>
              <h2 className="mb-2 text-xl font-semibold text-[#111827]">Check je e-mail</h2>
              <p className="text-[#6B7280]">
                We hebben een reset-link gestuurd naar{" "}
                <strong className="text-[#111827]">{email}</strong>.
              </p>
              <button
                onClick={() => { setResetSent(false); setShowReset(false); }}
                className="mt-6 text-sm text-[#9462A6] underline"
              >
                Terug naar inloggen
              </button>
            </div>
          ) : showReset ? (
            <>
              <h2 className="mb-1 text-xl font-semibold text-[#111827]">Wachtwoord vergeten</h2>
              <p className="mb-6 text-sm text-[#6B7280]">
                Vul je e-mailadres in. Je ontvangt een link om je wachtwoord opnieuw in te stellen.
              </p>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-[#374151]">
                    E-mailadres
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="naam@kplusv.nl"
                    required
                    className="w-full rounded-lg border border-[#E2DFF0] px-4 py-2.5 text-sm outline-none focus:border-[#9462A6] focus:ring-2 focus:ring-[#EDE8F5]"
                  />
                </div>
                {error && (
                  <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-lg bg-[#9462A6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5760A6] disabled:opacity-50"
                >
                  {loading ? "Bezig..." : "Reset-link sturen →"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReset(false); setError(null); }}
                  className="w-full text-center text-sm text-[#6B7280] hover:text-[#111827]"
                >
                  Terug naar inloggen
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="mb-1 text-xl font-semibold text-[#111827]">Inloggen</h2>
              <p className="mb-6 text-sm text-[#6B7280]">
                Vul je e-mailadres en wachtwoord in.
              </p>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#374151]">
                    E-mailadres
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="naam@kplusv.nl"
                    required
                    className="w-full rounded-lg border border-[#E2DFF0] px-4 py-2.5 text-sm outline-none focus:border-[#9462A6] focus:ring-2 focus:ring-[#EDE8F5]"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#374151]">
                    Wachtwoord
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-[#E2DFF0] px-4 py-2.5 text-sm outline-none focus:border-[#9462A6] focus:ring-2 focus:ring-[#EDE8F5]"
                  />
                </div>
                {error && (
                  <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full rounded-lg bg-[#9462A6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5760A6] disabled:opacity-50"
                >
                  {loading ? "Bezig..." : "Inloggen →"}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setError(null); }}
                    className="text-sm text-[#9462A6] hover:underline"
                  >
                    Wachtwoord vergeten?
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-[#6B7280]">
          Geen account? Vraag een uitnodigingslink aan bij de poolbeheerder.
        </p>
      </div>
    </div>
  );
}
