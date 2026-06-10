"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { TTT_TEAM_POINTS } from "@/lib/scoring";

type Props = {
  stageId: string;
  stageNumber: number;
};

export function TttResultForm({ stageId, stageNumber }: Props) {
  const router = useRouter();
  const [teams, setTeams] = useState<string[]>([]);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [existing, setExisting] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Haal unieke teamnamen op
    supabase
      .from("riders")
      .select("team_name")
      .eq("is_dns", false)
      .then(({ data }) => {
        const unique = [...new Set((data ?? []).map((r) => r.team_name))].sort();
        setTeams(unique);
      });

    // Haal bestaande TTT-resultaten op
    supabase
      .from("ttt_team_results")
      .select("team_name, position")
      .eq("stage_id", stageId)
      .then(({ data }) => {
        const map: Record<number, string> = {};
        for (const r of data ?? []) map[r.position] = r.team_name;
        setSelections(map);
        setExisting(map);
      });
  }, [stageId]);

  const positions = [1, 2, 3, 4, 5];
  const selectedTeams = new Set(Object.values(selections).filter(Boolean));
  const allFilled = positions.every((p) => selections[p]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/save-ttt-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage_id: stageId,
        results: positions.map((pos) => ({
          position: pos,
          team_name: selections[pos],
        })),
      }),
    });

    const data = await res.json();
    if (data.error) {
      setMessage({ type: "error", text: "Opslaan mislukt: " + data.error });
    } else {
      setMessage({ type: "success", text: "TTT-resultaten opgeslagen!" });
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-[#E2DFF0] bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-[#111827]">
        🚴‍♂️ TTT Ploegresultaten — Etappe {stageNumber}
      </h3>
      <p className="mb-4 text-sm text-[#6B7280]">
        Voer de top 5 ploegen in. Elke renner van deze ploegen ontvangt de bijbehorende punten, gewogen via de wortelregel.
      </p>

      <div className="space-y-2">
        {positions.map((pos) => {
          const pts = TTT_TEAM_POINTS[pos] ?? 0;
          return (
            <div key={pos} className="flex items-center gap-3">
              <div className="flex w-20 shrink-0 items-center gap-1.5">
                <span className="w-6 text-right text-sm font-bold text-[#111827]">{pos}.</span>
                <span className="rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-xs text-[#6B7280]">+{pts}</span>
              </div>
              <select
                value={selections[pos] ?? ""}
                onChange={(e) => setSelections((prev) => ({ ...prev, [pos]: e.target.value }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-[#9462A6] focus:ring-1 focus:ring-[#EDE8F5] ${
                  selections[pos]
                    ? "border-[#9462A6] bg-[#EDE8F5] text-[#5760A6]"
                    : "border-[#E2DFF0] bg-white text-[#374151]"
                }`}
              >
                <option value="">— Kies een ploeg —</option>
                {teams.map((team) => {
                  const alreadyUsed = selectedTeams.has(team) && selections[pos] !== team;
                  return (
                    <option key={team} value={team} disabled={alreadyUsed}>
                      {team}{alreadyUsed ? " ✓" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!allFilled || saving}
          className="rounded-lg bg-[#9462A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5760A6] disabled:opacity-40"
        >
          {saving ? "Opslaan..." : "TTT opslaan"}
        </button>
        {message && (
          <span className={`text-sm ${message.type === "success" ? "text-[#5760A6]" : "text-red-600"}`}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
