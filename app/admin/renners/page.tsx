import { createClient } from "@/lib/supabase/server";
import { SyncStartlistButton } from "./SyncStartlistButton";
import { RiderEditRow } from "./RiderEditRow";

export default async function AdminRennersPage() {
  const supabase = await createClient();

  const { data: riders } = await supabase
    .from("riders")
    .select("*")
    .order("bib_number", { ascending: true });

  // Check dekking per slot
  const slotCoverage: Record<number, number> = {};
  riders?.forEach((r) => {
    slotCoverage[r.bib_digit] = (slotCoverage[r.bib_digit] ?? 0) + 1;
  });

  const missingSlots = [1,2,3,4,5,6,7,8].filter((s) => !slotCoverage[s]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Renners / Startlijst</h1>
        <SyncStartlistButton />
      </div>

      {missingSlots.length > 0 && (
        <div className="mb-4 rounded-xl border border-[#FFD700] bg-[#FFF3B0] px-4 py-3 text-sm text-[#92400E]">
          ⚠ Geen renners voor slot(s): {missingSlots.map((s) => `…${s}`).join(", ")}
        </div>
      )}

      {/* Slot overzicht */}
      <div className="mb-6 grid grid-cols-8 gap-2">
        {[1,2,3,4,5,6,7,8].map((slot) => (
          <div
            key={slot}
            className={`rounded-lg p-2 text-center text-xs ${
              slotCoverage[slot] ? "bg-[#E8F7EE] text-[#006B35]" : "bg-red-50 text-red-600"
            }`}
          >
            <div className="font-bold">…{slot}</div>
            <div>{slotCoverage[slot] ?? 0} renners</div>
          </div>
        ))}
      </div>

      <div className="mb-2 text-sm text-[#6B7280]">
        {riders?.length ?? 0} renners geladen
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E5E0] bg-[#F9F9F7]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Naam</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">Ploeg</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Slot</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {riders?.map((rider) => (
              <RiderEditRow key={rider.id} rider={rider} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
