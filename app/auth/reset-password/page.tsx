"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase verwerkt de hash (#access_token=...) automatisch via onAuthStateChange
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }
    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens lang zijn.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Opslaan mislukt. Probeer opnieuw of vraag een nieuwe reset-link aan.");
    } else {
      setDone(true);
      setTimeout(() => router.push("/klassement"), 2000);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[#E2DFF0] bg-white p-8 shadow-sm">
          {done ? (
            <div className="text-center">
              <div className="mb-4 text-4xl">✅</div>
              <h2 className="mb-2 text-xl font-semibold text-[#111827]">Wachtwoord opgeslagen</h2>
              <p className="text-[#6B7280]">Je wordt doorgestuurd…</p>
            </div>
          ) : !ready ? (
            <div className="text-center">
              <div className="mb-4 text-4xl">🔗</div>
              <h2 className="mb-2 text-xl font-semibold text-[#111827]">Link verwerken…</h2>
              <p className="text-sm text-[#6B7280]">
                Even geduld. Als dit te lang duurt, vraag dan een nieuwe reset-link aan via{" "}
                <a href="/login" className="text-[#9462A6] underline">inlogpagina</a>.
              </p>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-xl font-semibold text-[#111827]">Nieuw wachtwoord instellen</h2>
              <p className="mb-6 text-sm text-[#6B7280]">Minimaal 8 tekens.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#374151]">
                    Nieuw wachtwoord
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-[#E2DFF0] px-4 py-2.5 text-sm outline-none focus:border-[#9462A6] focus:ring-2 focus:ring-[#EDE8F5]"
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-[#374151]">
                    Herhaal wachtwoord
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
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
                  disabled={loading || !password || !confirm}
                  className="w-full rounded-lg bg-[#9462A6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5760A6] disabled:opacity-50"
                >
                  {loading ? "Opslaan…" : "Wachtwoord opslaan →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
