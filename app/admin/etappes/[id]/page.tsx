import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { LockButton } from "./LockButton";

const RESULT_TYPE_LABELS: Record<string, string> = {
  stage_finish:      "Etappeuitslag",
  gc_standing:       "🟡 Algemeen klassement",
  mountain_standing: "🔴 Bergklassement",
  sprint_standing:   "🟢 Puntenklassement",
  white_standing:    "⚪ Jongerenklassement",
};

export default async function AdminEtappeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: stage } = await supabase
    .from("stages")
    .select("id, stage_number, stage_date, stage_type, departure, arrival, distance_km, status")
    .eq("id", id)
    .single();

  if (!stage) notFound();
  if (stage.status === "locked") redirect("/admin/etappes");

  const { data: results } = await supabase
    .from("stage_results")
    .select("position, result_type, riders(full_name, bib_number, team_name)")
    .eq("stage_id", id)
    .order("result_type")
    .order("position");

  const grouped: Record<string, typeof results> = {};
  for (const r of results ?? []) {
    if (!grouped[r.result_type]) grouped[r.result_type] = [];
    grouped[r.result_type]!.push(r);
  }

  const resultTypeOrder = ["stage_finish", "gc_standing", "mountain_standing", "sprint_standing", "white_standing"];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/etappes" className="mb-1 flex items-center gap-1 text-sm text-[#9462A6] hover:underline">
            ← Terug naar etappes
          </Link>
          <h1 className="text-2xl font-bold text-[#111827]">
            Etappe {stage.stage_number} — {stage.departure} → {stage.arrival}
          </h1>
          <p className="text-sm text-[#6B7280]">
            {new Date(stage.stage_date).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
            {stage.distance_km && ` · ${stage.distance_km} km`}
          </p>
        </div>
        {stage.status === "results_pending" && (
          <LockButton stageId={stage.id} />
        )}
      </div>

      {!results?.length ? (
        <div className="rounded-2xl border border-dashed border-[#E2DFF0] bg-white p-12 text-center text-[#6B7280]">
          Nog geen resultaten geladen voor deze etappe.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {resultTypeOrder.filter((t) => grouped[t]?.length).map((type) => (
            <div key={type} className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
              <div className="border-b border-[#E2DFF0] bg-[#F3F1FA] px-4 py-2.5">
                <h2 className="text-sm font-semibold text-[#5760A6]">{RESULT_TYPE_LABELS[type]}</h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {grouped[type]!.map((r) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const rider = r.riders as any;
                    return (
                      <tr key={`${type}-${r.position}`} className="border-b border-[#F3F4F6] last:border-0">
                        <td className="w-8 px-4 py-2 text-center font-bold text-[#9462A6]">{r.position}</td>
                        <td className="px-2 py-2 font-medium text-[#111827]">{rider?.full_name ?? "—"}</td>
                        <td className="px-4 py-2 text-right text-xs text-[#6B7280]">
                          #{rider?.bib_number} · {rider?.team_name}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
