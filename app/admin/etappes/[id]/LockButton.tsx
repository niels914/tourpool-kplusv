"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LockButton({ stageId }: { stageId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function lock() {
    if (!confirm("Etappe vergrendelen? Dit kan niet ongedaan worden gemaakt.")) return;
    setLoading(true);
    const res = await fetch("/api/admin/lock-stage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage_id: stageId }),
    });
    const data = await res.json();
    if (data.error) {
      alert("Fout: " + data.error);
      setLoading(false);
    } else {
      router.push("/admin/etappes");
    }
  }

  return (
    <button
      onClick={lock}
      disabled={loading}
      className="rounded-lg bg-[#9462A6] px-4 py-2 text-sm font-medium text-white hover:bg-[#5760A6] disabled:opacity-50"
    >
      {loading ? "Vergrendelen…" : "✓ Vergrendel etappe"}
    </button>
  );
}
