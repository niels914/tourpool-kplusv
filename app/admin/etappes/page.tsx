import { createClient } from "@/lib/supabase/server";
import { StageRow } from "./StageRow";
import { SeedStagesButton } from "./SeedStagesButton";

export default async function AdminEtappesPage() {
  const supabase = await createClient();

  const { data: stages } = await supabase
    .from("stages")
    .select("*")
    .order("stage_number", { ascending: true });

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Etappes</h1>
        <div className="flex gap-2">
          <SeedStagesButton />
        </div>
      </div>

      {!stages?.length ? (
        <div className="rounded-2xl border border-dashed border-[#E2DFF0] bg-white p-12 text-center">
          <p className="text-[#6B7280]">Geen etappes geladen. Gebruik de knop hierboven om het schema in te laden.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2DFF0] bg-[#F3F1FA]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Et.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Datum</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">Route</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Type</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                <th className="px-4 py-3">Acties</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((stage) => (
                <StageRow key={stage.id} stage={stage} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
