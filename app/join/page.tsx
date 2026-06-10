"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [prefillEmail, setPrefillEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setChecking(false);
      setError("Geen geldige uitnodigingslink. Vraag een nieuwe link aan bij de poolbeheerder.");
      return;
    }

    const supabase = createClient();
    supabase
      .from("invitations")
      .select("id, email, used_at")
      .eq("token", token)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("Uitnodigingslink niet gevonden.");
        } else if (data.used_at) {
          setError("Deze uitnodigingslink is al gebruikt.");
        } else {
          setInvitationId(data.id);
          if (data.email) {
            setEmail(data.email);
            setPrefillEmail(data.email);
          }
        }
        setChecking(false);
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invitationId) return;
    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens lang zijn.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Account aanmaken
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("Dit e-mailadres is al in gebruik. Probeer in te loggen.");
      } else {
        setError(`Registratie mislukt: ${signUpError.message}`);
      }
      setLoading(false);
      return;
    }

    if (!signUpData.user) {
      setError("Registratie mislukt. Probeer opnieuw.");
      setLoading(false);
      return;
    }

    // Uitnodiging markeren als gebruikt
    await supabase
      .from("invitations")
      .update({ used_at: new Date().toISOString(), used_by: signUpData.user.id })
      .eq("id", invitationId);

    router.push("/registratie");
  }

  if (checking) {
    return (
      <div className="text-center py-8">
        <div className="text-2xl mb-2">⏳</div>
        <p className="text-[#6B7280] text-sm">Uitnodiging controleren…</p>
      </div>
    );
  }

  if (error && !invitationId) {
    return (
      <div className="text-center py-8">
        <div className="text-2xl mb-3">❌</div>
        <p className="text-[#374151] font-medium">Ongeldige uitnodiging</p>
        <p className="mt-1 text-sm text-[#6B7280]">{error}</p>
        <a href="/login" className="mt-4 inline-block text-sm text-[#9462A6] underline">
          Terug naar inloggen
        </a>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-1 text-xl font-semibold text-[#111827]">Account aanmaken</h2>
      <p className="mb-6 text-sm text-[#6B7280]">
        Welkom bij de KplusV Tourpool! Kies een weergavenaam en wachtwoord.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-[#374151]">
            Weergavenaam
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="bijv. Niels A."
            required
            maxLength={50}
            className="w-full rounded-lg border border-[#E2DFF0] px-4 py-2.5 text-sm outline-none focus:border-[#9462A6] focus:ring-2 focus:ring-[#EDE8F5]"
          />
        </div>

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
            disabled={!!prefillEmail}
            className={`w-full rounded-lg border border-[#E2DFF0] px-4 py-2.5 text-sm outline-none focus:border-[#9462A6] focus:ring-2 focus:ring-[#EDE8F5] ${prefillEmail ? "bg-[#F8F7FC] text-[#6B7280]" : ""}`}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#374151]">
            Wachtwoord <span className="text-[#9CA3AF]">(min. 8 tekens)</span>
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

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !displayName || !email || !password}
          className="w-full rounded-lg bg-[#9462A6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5760A6] disabled:opacity-50"
        >
          {loading ? "Account aanmaken…" : "Account aanmaken →"}
        </button>
      </form>
    </>
  );
}

export default function JoinPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 overflow-hidden rounded-2xl">
            <Image src="/kplusv-logo.jpg" alt="KplusV" width={64} height={64} className="rounded-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-[#111827]">KplusV Tourpool</h1>
          <p className="mt-1 text-[#6B7280]">Tour de France 2026</p>
        </div>

        <div className="rounded-2xl border border-[#E2DFF0] bg-white p-8 shadow-sm">
          <Suspense fallback={<div className="text-center py-8 text-sm text-[#6B7280]">Laden…</div>}>
            <JoinForm />
          </Suspense>
        </div>

        <p className="mt-4 text-center text-xs text-[#6B7280]">
          Al een account?{" "}
          <a href="/login" className="text-[#9462A6] underline">Inloggen</a>
        </p>
      </div>
    </div>
  );
}
