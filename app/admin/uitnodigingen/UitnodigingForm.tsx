"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function UitnodigingForm({ userId }: { userId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.from("invitations").insert({
      email: email || null,
      created_by: userId,
    });

    if (error) {
      setMessage("Aanmaken mislukt: " + error.message);
    } else {
      setMessage("Uitnodiging aangemaakt.");
      setEmail("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-[#E2DFF0] bg-white p-5">
      <h2 className="mb-3 font-semibold text-[#111827]">Nieuwe uitnodiging</h2>
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="email"
          placeholder="naam@kplusv.nl (optioneel)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border border-[#E2DFF0] px-3 py-2 text-sm outline-none focus:border-[#9462A6]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-[#FFD700] hover:bg-[#333] disabled:opacity-50"
        >
          {loading ? "…" : "Aanmaken"}
        </button>
      </form>
      {message && (
        <p className="mt-2 text-sm text-[#5760A6]">{message}</p>
      )}
    </div>
  );
}
