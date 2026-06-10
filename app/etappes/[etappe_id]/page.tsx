import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { stageFinishPoints, jerseyPoints, tttTeamPoints } from "@/lib/scoring";

export const revalidate = 60;

const PROFILE_ICONS: Record<string, { emoji: string; label: string }> = {
  vlak:    { emoji: "🟢", label: "Vlak" },
  heuvel:  { emoji: "🟡", label: "Heuvel" },
  berg:    { emoji: "🔴", label: "Berg" },
  tijdrit: { emoji: "⏱️", label: "Tijdrit" },
};

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
    .select("id, stage_number, stage_date, stage_type, profile, departure, arrival, distance_km, status, pcs_stage_url")
    .eq("id", etappe_id)
    .single();

  if (!stage) notFound();

  const { data: results } = await supabase
    .from("stage_results")
    .select("*, riders(full_name, team_name, bib_number)")
    .eq("stage_id", etappe_id)
    .order("result_type", { ascending: true })
    .order("position", { ascending: true });

  // TTT ploegresultaten
  const { data: tttResults } = await supabase
    .from("ttt_team_results")
    .select("id, team_name, position")
    .eq("stage_id", etappe_id)
    .order("position", { ascending: true });

  // Dagprijs: wie scoorde het meest in deze etappe?
  const { data: dagprijsData } = await supabase
    .from("user_stage_points")
    .select("user_id, weighted_points")
    .eq("stage_id", etappe_id)
    .order("weighted_points", { ascending: false })
    .limit(1)
    .single();

  let dagprijsProfile: { display_name: string; nickname: string | null } | null = null;
  if (dagprijsData) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("display_name, nickname")
      .eq("id", dagprijsData.user_id)
      .single();
    dagprijsProfile = prof;
  }

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
          <span className="rounded-full bg-[#5760A6] px-3 py-1 text-sm font-bold text-white">
            Etappe {stage.stage_number}
          </span>
          {(() => {
            const prof = PROFILE_ICONS[stage.profile] ?? PROFILE_ICONS["vlak"];
            return (
              <span className="rounded-full bg-[#F3F1FA] px-2.5 py-1 text-xs font-medium text-[#5760A6]">
                {prof.emoji} {prof.label}
              </span>
            );
          })()}
          <span className="text-sm text-[#6B7280]">
            {new Date(stage.stage_date).toLocaleDateString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#111827]">
          {stage.departure && stage.arrival
            ? `${stage.departure} → ${stage.arrival}`
            : `Etappe ${stage.stage_number}`}
        </h1>
        {stage.distance_km && (
          <p className="text-[#6B7280]">{stage.distance_km} km</p>
        )}
        {/* Dagprijs */}
        {stage.status === "locked" && dagprijsData && dagprijsProfile && (
          <Link
            href={`/deelnemers/${dagprijsData.user_id}`}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#FEF9C3] px-4 py-2 transition hover:bg-[#FEF08A]"
          >
            <span className="text-lg">🏆</span>
            <div>
              <span className="text-xs font-semibold text-[#92400E]">Dagprijs</span>
              <span className="ml-1.5 text-sm font-medium text-[#78350F]">
                {dagprijsProfile.nickname ?? dagprijsProfile.display_name}
              </span>
              <span className="ml-2 text-xs font-bold text-[#92400E]">
                {Number(dagprijsData.weighted_points).toFixed(2)} ptn
              </span>
            </div>
          </Link>
        )}
      </div>

      {stage.status !== "locked" ? (
        <div className="rounded-2xl border border-dashed border-[#E2DFF0] bg-white p-12 text-center">
          <p className="text-[#6B7280]">
            Uitslagen zijn nog niet beschikbaar voor deze etappe.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TTT ploegresultaten */}
          {stage.stage_type === "ttt" && tttResults && tttResults.length > 0 && (
            <div className="rounded-2xl border border-[#E2DFF0] bg-white overflow-hidden">
              <div className="border-b border-[#E2DFF0] bg-[#F3F1FA] px-4 py-3">
                <h2 className="font-semibold text-[#111827]">
                  🚴‍♂️ Ploegentijdrit — Ploegklassement
                </h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F3F4F6] text-[#6B7280]">
                    <th className="px-4 py-2 text-left">Pos.</th>
                    <th className="px-4 py-2 text-left">Ploeg</th>
                    <th className="px-4 py-2 text-right">Punten/renner</th>
                  </tr>
                </thead>
                <tbody>
                  {tttResults.map((r) => {
                    const pts = tttTeamPoints(r.position);
                    return (
                      <tr key={r.id} className="border-b border-[#F3F4F6]">
                        <td className="px-4 py-2 font-medium">{r.position}</td>
                        <td className="px-4 py-2 font-medium text-[#111827]">{r.team_name}</td>
                        <td className="px-4 py-2 text-right font-semibold text-[#5760A6]">
                          {pts > 0 ? pts : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="border-t border-[#E2DFF0] bg-[#F8F7FC] px-4 py-2.5 text-xs text-[#6B7280]">
                Elke renner van een top-5 ploeg ontvangt bovenstaande punten, gewogen via de wortelregel.
              </div>
            </div>
          )}

          {/* Reguliere resultaten */}
          {Object.entries(RESULT_TYPE_LABELS).map(([type, { label, emoji }]) => {
            const typeResults = grouped[type];
            if (!typeResults?.length) return null;
            return (
              <div key={type} className="rounded-2xl border border-[#E2DFF0] bg-white overflow-hidden">
                <div className="border-b border-[#E2DFF0] bg-[#F3F1FA] px-4 py-3">
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
                          <td className="px-4 py-2 text-right font-semibold text-[#5760A6]">
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
