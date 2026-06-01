"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SeedStagesButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSeed() {
    if (!confirm("Tour 2026 etappeschema inladen? Bestaande etappes worden bijgewerkt.")) return;
    setLoading(true);
    const res = await fetch("/api/admin/seed-stages", { method: "POST" });
    const data = await res.json();
    if (data.error) alert("Fout: " + data.error);
    else router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="rounded-lg border border-[#E5E5E0] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:border-[#00A651] disabled:opacity-50"
    >
      {loading ? "Bezig…" : "Etappeschema inladen"}
    </button>
  );
}
