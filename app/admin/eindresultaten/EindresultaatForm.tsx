"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Rider = {
  id: string;
  bib_number: number;
  full_name: string;
  team_name: string;
};

type Props = {
  classification: "final_gc" | "final_mountain" | "final_sprint" | "final_white";
  positions: number[];
  points: number[];
  riders: Rider[];
  existingByKey: Record<string, string>;
};

export function EindresultaatForm({
  classification,
  positions,
  points,
  riders,
  existingByKey,
}: Props) {
  const router = useRouter();

  const initialSelections: Record<number, string> = {};
  positions.forEach((pos) => {
    const riderId = existingByKey[`${classification}_${pos}`];
    if (riderId) initialSelections[pos] = riderId;
  });

  const [selections, setSelections] = useState<Record<number, string>>(
    initialSelections
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const allFilled = positions.every((pos) => selections[pos]);
  const selectedIds = new Set(Object.values(selections).filter(Boolean));

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const payload = positions.map((pos) => ({
      result_type: classification,
      position: pos,
      rider_id: selections[pos],
    }));

    const res = await fetch("/api/admin/save-final-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: payload }),
    });

    const data = await res.json();

    if (data.error) {
      setMessage({ type: "error", text: "Opslaan mislukt: " + data.error });
    } else {
      setMessage({ type: "success", text: "Opgeslagen!" });
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-2">
      {positions.map((pos, i) => {
        const currentVal = selections[pos] ?? "";
        const isSelected = !!currentVal;

        return (
          <div key={pos} className="flex items-center gap-3">
            {/* Positie + punten */}
            <div className="flex w-20 shrink-0 items-center gap-1.5">
              <span className="w-6 text-right text-sm font-bold text-[#111827]">
                {pos}.
              </span>
              <span className="rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-xs text-[#6B7280]">
                +{points[i]}
              </span>
            </div>

            {/* Renner dropdown */}
            <select
              value={currentVal}
              onChange={(e) =>
                setSelections((prev) => ({ ...prev, [pos]: e.target.value }))
              }
              className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-[#00A651] focus:ring-1 focus:ring-[#E8F7EE] ${
                isSelected
                  ? "border-[#00A651] bg-[#E8F7EE] text-[#006B35]"
                  : "border-[#E5E5E0] bg-white text-[#374151]"
              }`}
            >
              <option value="">— Kies een renner —</option>
              {riders.map((rider) => {
                const alreadyUsed =
                  selectedIds.has(rider.id) && selections[pos] !== rider.id;
                return (
                  <option
                    key={rider.id}
                    value={rider.id}
                    disabled={alreadyUsed}
                  >
                    #{rider.bib_number} {rider.full_name} ({rider.team_name})
                    {alreadyUsed ? " ✓" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        );
      })}

      {/* Opslaan */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={!allFilled || saving}
          className="rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-[#FFD700] hover:bg-[#333] disabled:opacity-40"
        >
          {saving ? "Opslaan…" : "Opslaan"}
        </button>

        {message && (
          <span
            className={`text-sm ${
              message.type === "success"
                ? "text-[#006B35]"
                : "text-red-600"
            }`}
          >
            {message.text}
          </span>
        )}

        {!allFilled && (
          <span className="text-xs text-[#6B7280]">
            Nog{" "}
            {positions.filter((p) => !selections[p]).length} positie
            {positions.filter((p) => !selections[p]).length > 1 ? "s" : ""}{" "}
            leeg
          </span>
        )}
      </div>
    </div>
  );
}
