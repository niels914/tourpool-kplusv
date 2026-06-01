"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncStartlistButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync() {
    if (!confirm("Startlijst ophalen van ProCyclingStats? Bestaande renners worden bijgewerkt.")) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/sync-startlist", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setMessage("Fout: " + data.error);
      } else {
        setMessage(`Gesynchroniseerd: ${data.added} toegevoegd, ${data.updated} bijgewerkt.`);
        router.refresh();
      }
    } catch {
      setMessage("Verbindingsfout. Probeer opnieuw.");
    }
    setLoading(false);
  }

  return (
    <div className="text-right">
      <button
        onClick={handleSync}
        disabled={loading}
        className="rounded-lg bg-[#00A651] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006B35] disabled:opacity-50"
      >
        {loading ? "Bezig…" : "Startlijst synchroniseren"}
      </button>
      {message && <p className="mt-1 text-xs text-[#6B7280]">{message}</p>}
    </div>
  );
}
