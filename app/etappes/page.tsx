import { createClient } from "@/lib/supabase/server";
import { EtappeRow } from "./EtappeRow";

export const revalidate = 300;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  scheduled:       { label: "Gepland",    color: "bg-gray-100 text-gray-600" },
  live:            { label: "Live",       color: "bg-red-100 text-red-700" },
  results_pending: { label: "Uitslag",    color: "bg-yellow-100 text-yellow-700" },
  locked:          { label: "Afgerond",   color: "bg-green-100 text-green-700" },
};

const TYPE_LABELS: Record<string, string> = {
  rit: "Rit",
  ttt: "TTT",
  itt: "ITT",
};

export default async function EtappesPage() {
  const supabase = await createClient();

  const { data: stages } = await supabase
    .from("stages")
    .select("*")
    .order("stage_number", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-1 text-3xl font-bold text-[#1A1A1A]">Etappes</h1>
      <p className="mb-8 text-[#6B7280]">Tour de France 2026 — 27 juni t/m 20 juli</p>

      {!stages || stages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E2DFF0] bg-white p-12 text-center">
          <p className="text-[#6B7280]">Het etappeschema is nog niet geladen.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2DFF0] bg-[#F3F1FA]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Et.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Datum</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">Route</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] md:table-cell">Type</th>
                <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280] md:table-cell">km</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((stage) => {
                const status = STATUS_LABELS[stage.status] ?? STATUS_LABELS.scheduled;
                const isClickable = stage.status === "locked" || stage.status === "results_pending";

                return (
                  <EtappeRow
                    key={stage.id}
                    id={stage.id}
                    isClickable={isClickable}
                    stageNumber={stage.stage_number}
                    stageDate={stage.stage_date}
                    departure={stage.departure}
                    arrival={stage.arrival}
                    stageType={stage.stage_type}
                    typeLabel={TYPE_LABELS[stage.stage_type] ?? stage.stage_type}
                    distanceKm={stage.distance_km}
                    statusLabel={status.label}
                    statusColor={status.color}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-[#6B7280]">
        TTT-etappes tellen niet mee voor de puntentelling.
      </p>
    </div>
  );
}
