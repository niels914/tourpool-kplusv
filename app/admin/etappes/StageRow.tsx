"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Stage = {
  id: string;
  stage_number: number;
  stage_date: string;
  stage_type: "rit" | "ttt" | "itt";
  departure: string | null;
  arrival: string | null;
  distance_km: number | null;
  status: "scheduled" | "live" | "results_pending" | "locked";
};

const STATUS_LABELS = {
  scheduled:       "Gepland",
  live:            "Live",
  results_pending: "Te controleren",
  locked:          "Vergrendeld",
};

export function StageRow({ stage }: { stage: Stage }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function syncResults() {
    setLoading(true);
    const res = await fetch(`/api/admin/sync-stage?stage_id=${stage.id}`, { method: "POST" });
    const data = await res.json();
    if (data.error) alert("Fout: " + data.error);
    router.refresh();
    setLoading(false);
  }

  async function lockStage() {
    if (!confirm(`Etappe ${stage.stage_number} vergrendelen? Dit kan niet ongedaan worden gemaakt.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/lock-stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage_id: stage.id }),
    });
    const data = await res.json();
    if (data.error) alert("Fout: " + data.error);
    router.refresh();
    setLoading(false);
  }

  return (
    <tr className="border-b border-[#F3F4F6]">
      <td className="px-4 py-2.5 font-medium text-[#111827]">{stage.stage_number}</td>
      <td className="px-4 py-2.5 text-[#374151]">
        {new Date(stage.stage_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
      </td>
      <td className="hidden px-4 py-2.5 text-[#6B7280] sm:table-cell">
        {stage.departure && stage.arrival ? `${stage.departure} → ${stage.arrival}` : "—"}
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
          stage.stage_type === "ttt" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
        }`}>
          {stage.stage_type.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          stage.status === "locked" ? "bg-[#EDE8F5] text-[#5760A6]" :
          stage.status === "results_pending" ? "bg-[#EDE8F5] text-[#5760A6]" :
          stage.status === "live" ? "bg-red-100 text-red-700" :
          "bg-gray-100 text-gray-600"
        }`}>
          {STATUS_LABELS[stage.status]}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex gap-1">
          {stage.status !== "locked" && stage.stage_type !== "ttt" && (
            <button
              onClick={syncResults}
              disabled={loading}
              className="rounded px-2.5 py-1 text-xs font-medium bg-[#EDE8F5] text-[#5760A6] hover:bg-[#D1FAE5] disabled:opacity-50"
            >
              {loading ? "…" : "Sync"}
            </button>
          )}
          {stage.status === "results_pending" && (
            <button
              onClick={lockStage}
              disabled={loading}
              className="rounded px-2.5 py-1 text-xs font-medium bg-[#1A1A1A] text-[#FFD700] hover:bg-[#333] disabled:opacity-50"
            >
              Vergrendel
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
