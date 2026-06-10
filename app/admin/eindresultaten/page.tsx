import { createClient } from "@/lib/supabase/server";
import { EindresultaatForm } from "./EindresultaatForm";

const CLASSIFICATIONS = [
  {
    key: "final_gc" as const,
    label: "Algemeen klassement",
    emoji: "🟡",
    positions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    points: [40, 30, 22, 16, 12, 10, 8, 6, 4, 2],
  },
  {
    key: "final_mountain" as const,
    label: "Bergklassement",
    emoji: "🔴",
    positions: [1, 2, 3, 4, 5],
    points: [12, 8, 6, 4, 2],
  },
  {
    key: "final_sprint" as const,
    label: "Puntenklassement",
    emoji: "🟢",
    positions: [1, 2, 3, 4, 5],
    points: [12, 8, 6, 4, 2],
  },
  {
    key: "final_white" as const,
    label: "Jongerenklassement",
    emoji: "⚪",
    positions: [1, 2, 3, 4, 5],
    points: [12, 8, 6, 4, 2],
  },
];

export default async function AdminEindresultatenPage() {
  const supabase = await createClient();

  const { data: riders } = await supabase
    .from("riders")
    .select("id, bib_number, full_name, team_name")
    .eq("is_dns", false)
    .order("full_name", { ascending: true });

  const { data: existing } = await supabase
    .from("final_results")
    .select("rider_id, result_type, position");

  // Groepeer bestaande resultaten per type + positie
  const existingByKey: Record<string, string> = {};
  existing?.forEach((r) => {
    existingByKey[`${r.result_type}_${r.position}`] = r.rider_id;
  });

  const allSaved = CLASSIFICATIONS.every((cls) =>
    cls.positions.every((pos) => existingByKey[`${cls.key}_${pos}`])
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Eindresultaten</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Voer de eindstanden in na afloop van de Tour. De bonuspunten worden
          automatisch berekend.
        </p>
      </div>

      {allSaved && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-[#EDE8F5] px-4 py-3 text-sm text-[#5760A6]">
          <span>✓</span>
          <span>
            Alle eindresultaten zijn ingevoerd. Bonuspunten zijn verwerkt in
            het klassement.
          </span>
        </div>
      )}

      <div className="space-y-6">
        {CLASSIFICATIONS.map((cls) => (
          <div
            key={cls.key}
            className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm"
          >
            <div className="border-b border-[#E2DFF0] bg-[#F3F1FA] px-4 py-3">
              <h2 className="font-semibold text-[#111827]">
                {cls.emoji} {cls.label}
              </h2>
            </div>
            <div className="p-4">
              <EindresultaatForm
                classification={cls.key}
                positions={cls.positions}
                points={cls.points}
                riders={riders ?? []}
                existingByKey={existingByKey}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
