"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Er ging iets mis. Controleer je e-mailadres en probeer opnieuw.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#5760A6]">
            <span className="text-2xl">🚴</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            KplusV Tourpool
          </h1>
          <p className="mt-1 text-[#6B7280]">Tour de France 2026</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#E2DFF0] bg-white p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="mb-4 text-4xl">📬</div>
              <h2 className="mb-2 text-xl font-semibold text-[#111827]">
                Check je e-mail
              </h2>
              <p className="text-[#6B7280]">
                We hebben een inloglink gestuurd naar{" "}
                <strong className="text-[#111827]">{email}</strong>.
                Klik op de link om in te loggen.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 text-sm text-[#9462A6] underline"
              >
                Ander e-mailadres gebruiken
              </button>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-xl font-semibold text-[#111827]">
                Inloggen
              </h2>
              <p className="mb-6 text-sm text-[#6B7280]">
                Vul je KplusV e-mailadres in. Je ontvangt een inloglink.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-[#374151]"
                  >
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

                {error && (
                  <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-lg bg-[#9462A6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5760A6] disabled:opacity-50"
                >
                  {loading ? "Bezig..." : "Inloglink sturen →"}
                </button>
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
