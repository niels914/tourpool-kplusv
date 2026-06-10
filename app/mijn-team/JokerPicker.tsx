"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const PROFILE_ICONS: Record<string, { emoji: string; label: string }> = {
  vlak:    { emoji: "🟢", label: "Vlak" },
  heuvel:  { emoji: "🟡", label: "Heuvel" },
  berg:    { emoji: "🔴", label: "Berg" },
  tijdrit: { emoji: "⏱️", label: "Tijdrit" },
};

type Stage = {
  stage_number: number;
  stage_type: string;
  profile: string;
  departure: string | null;
  arrival: string | null;
  distance_km: number | null;
};

type Props = {
  userId: string;
  stages: Stage[];
  currentPick: number | null;
};

export function JokerPicker({ userId, stages, currentPick }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(currentPick);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    if (selected === null) return;
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    await supabase.from("joker_picks").delete().eq("user_id", userId);

    const { error } = await supabase.from("joker_picks").insert({
      user_id: userId,
      stage_number: selected,
    });

    if (error) {
      setMessage("Opslaan mislukt: " + error.message);
    } else {
      setMessage("Joker opgeslagen!");
      router.refresh();
    }
    setSaving(false);
  }

  const hasChanged = selected !== null && selected !== currentPick;
  const eligible = stages.filter((s) => s.stage_type !== "ttt");

  return (
    <div className="rounded-2xl border border-[#E2DFF0] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">🃏</span>
        <h3 className="font-semibold text-[#111827]">Joker-etappe</h3>
      </div>
      <p className="mb-4 text-sm text-[#6B7280]">
        Kies <strong>1 etappe</strong> waarop je punten ×1.5 worden. Je keuze is geheim en wordt
        pas aan het einde van de Tour onthuld en meegeteld.
      </p>

      <div className="mb-4 max-h-[400px] overflow-y-auto rounded-xl border border-[#E2DFF0]">
        {eligible.map((s) => {
          const isSelected = selected === s.stage_number;
          const prof = PROFILE_ICONS[s.profile] ?? PROFILE_ICONS["vlak"];
          return (
            <button
              key={s.stage_number}
              onClick={() => setSelected(isSelected ? null : s.stage_number)}
              className={`flex w-full items-center gap-3 border-b border-[#F3F4F6] px-4 py-3 text-left text-sm transition last:border-b-0 ${
                isSelected
                  ? "bg-[#EDE8F5]"
                  : "bg-white hover:bg-[#F8F7FC]"
              }`}
            >
              {/* Etappenummer */}
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                isSelected
                  ? "bg-[#9462A6] text-white"
                  : "bg-[#F3F1FA] text-[#5760A6]"
              }`}>
                {s.stage_number}
              </span>

              {/* Profiel */}
              <span className="flex w-20 shrink-0 items-center gap-1 text-xs">
                <span>{prof.emoji}</span>
                <span className="text-[#6B7280]">{prof.label}</span>
              </span>

              {/* Route */}
              <span className="flex-1 truncate text-[#374151]">
                {s.departure && s.arrival
                  ? `${s.departure} → ${s.arrival}`
                  : "Route onbekend"}
              </span>

              {/* Afstand */}
              {s.distance_km && (
                <span className="shrink-0 text-xs text-[#9CA3AF]">
                  {s.distance_km} km
                </span>
              )}

              {/* Joker indicator */}
              {isSelected && (
                <span className="shrink-0 rounded-full bg-[#9462A6] px-2 py-0.5 text-[10px] font-bold text-white">
                  🃏 JOKER
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={selected === null || saving || !hasChanged}
          className="rounded-lg bg-[#9462A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5760A6] disabled:opacity-40"
        >
          {saving ? "Opslaan..." : "Joker opslaan"}
        </button>

        {selected !== null && (
          <span className="rounded-full bg-[#EDE8F5] px-3 py-1 text-xs font-semibold text-[#5760A6]">
            🃏 Etappe {selected}
          </span>
        )}

        {message && (
          <span className={`text-sm ${message.startsWith("Opslaan mislukt") ? "text-red-600" : "text-[#5760A6]"}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
