"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ profileId, displayName }: { profileId: string; displayName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Weet je zeker dat je "${displayName}" wilt verwijderen? Dit verwijdert het account, de ploeg en alle data permanent.`)) return;
    setLoading(true);
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: profileId }),
    });
    const data = await res.json();
    if (data.error) {
      alert("Fout: " + data.error);
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600"
    >
      {loading ? "…" : "Verwijderen"}
    </button>
  );
}
