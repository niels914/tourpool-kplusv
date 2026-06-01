import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { stageFinishPoints, jerseyPoints } from "@/lib/scoring";

export const revalidate = 60;

const RESULT_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  stage_finish:     { label: "Etappeuitslag", emoji: "🏁" },
  gc_standing:      { label: "Algemeen klassement",  emoji: "🟡" },
  mountain_standing:{ label: "Bergklassement",       emoji: "🔴" },
  sprint_standing:  { label: "Puntenklassement",     emoji: "🟢" },
  white_standing:   { label: "Jongerenklassement",   emoji: "⚪" },
};

export default async function EtappeDetailPage({
  params,
}: {
  params: Promise<{ etappe_id: string }>;
}) {
  const { etappe_id } = await params;
  const supabase = await createClient();

  const { data: stage } = await supabase
    .from("stages")
    .select("*")
    .eq("id", etappe_id)
    .single();

  if (!stage) notFound();

  const { data: results } = await supabase
    .from("stage_results")
    .select("*, riders(full_name, team_name, bib_number)")
    .eq("stage_id", etappe_id)
    .order("result_type", { ascending: true })
    .order("position", { ascending: true });

  // Groepeer op result_type
  const grouped: Record<string, typeof results> = {};
  results?.forEach((r) => {
    if (!grouped[r.result_type]) grouped[r.result_type] = [];
    grouped[r.result_type]!.push(r);
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/etappes" className="mb-6 inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827]">
        ← Terug naar etappes
      </Link>

      <div className="mb-8">
        <div className="mb-1 flex items-center gap-3">
          <span className="rounded-full bg-[#1A1A1A] px-3 py-1 text-sm font-bold text-[#FFD700]">
            Etappe {stage.stage_number}
          </span>
          <span className="text-sm text-[#6B7280]">
            {new Date(stage.stage_date).toLocaleDateString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {stage.departure && stage.arrival
            ? `${stage.departure} → ${stage.arrival}`
            : `Etappe ${stage.stage_number}`}
        </h1>
        {stage.distance_km && (
          <p className="text-[#6B7280]">{stage.distance_km} km</p>
        )}
      </div>

      {stage.status !== "locked" ? (
        <div className="rounded-2xl border border-dashed border-[#E5E5E0] bg-white p-12 text-center">
          <p className="text-[#6B7280]">
            Uitslagen zijn nog niet beschikbaar voor deze etappe.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(RESULT_TYPE_LABELS).map(([type, { label, emoji }]) => {
            const typeResults = grouped[type];
            if (!typeResults?.length) return null;
            return (
              <div key={type} className="rounded-2xl border border-[#E5E5E0] bg-white overflow-hidden">
                <div className="border-b border-[#E5E5E0] bg-[#F9F9F7] px-4 py-3">
                  <h2 className="font-semibold text-[#111827]">
                    {emoji} {label}
                  </h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F3F4F6] text-[#6B7280]">
                      <th className="px-4 py-2 text-left">Pos.</th>
                      <th className="px-4 py-2 text-left">Renner</th>
                      <th className="hidden px-4 py-2 text-left sm:table-cell">Ploeg</th>
                      <th className="px-4 py-2 text-right">Punten</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeResults.map((r) => {
                      const raw =
                        type === "stage_finish"
                          ? stageFinishPoints(r.position)
                          : jerseyPoints(type, r.position);
                      const rider = r.riders as unknown as { full_name: string; team_name: string; bib_number: number } | null;
                      return (
                        <tr key={r.id} className="border-b border-[#F3F4F6]">
                          <td className="px-4 py-2 font-medium">{r.position}</td>
                          <td className="px-4 py-2">
                            <span className="font-medium text-[#111827]">
                              {rider?.full_name ?? "—"}
                            </span>
                            {rider && (
                              <span className="ml-2 text-xs text-[#6B7280]">
                                #{rider.bib_number}
                              </span>
                            )}
                          </td>
                          <td className="hidden px-4 py-2 text-[#6B7280] sm:table-cell">
                            {rider?.team_name ?? "—"}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-[#006B35]">
                            {raw}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
