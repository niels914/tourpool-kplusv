import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function KlassementPage() {
  const supabase = await createClient();

  const { data: klassement } = await supabase
    .from("klassement")
    .select("*")
    .order("rank", { ascending: true });

  const { data: stages } = await supabase
    .from("stages")
    .select("stage_number, status, stage_date")
    .order("stage_number", { ascending: true });

  const lockedStages = stages?.filter((s) => s.status === "locked").length ?? 0;
  const totalStages = stages?.length ?? 21;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Klassement</h1>
          <p className="mt-1 text-[#6B7280]">
            {lockedStages === 0
              ? "De Tour is nog niet begonnen"
              : `Na ${lockedStages} van ${totalStages} etappes`}
          </p>
        </div>
        <div className="rounded-xl bg-[#FFF3B0] px-4 py-2 text-center">
          <div className="text-2xl font-bold text-[#1A1A1A]">{lockedStages}</div>
          <div className="text-xs text-[#6B7280]">etappes</div>
        </div>
      </div>

      {!klassement || klassement.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E0] bg-[#F9F9F7]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Deelnemer
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Punten
                </th>
                <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">
                  Etappes
                </th>
                <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">
                  Bonus
                </th>
              </tr>
            </thead>
            <tbody>
              {klassement.map((entry, i) => (
                <tr
                  key={entry.user_id}
                  className={`border-b border-[#F3F4F6] transition hover:bg-[#FAFAF7] ${
                    i === 0 ? "bg-[#FFFBEB]" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <RankBadge rank={entry.rank} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#111827]">
                      {entry.display_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-lg font-bold text-[#111827]">
                      {Number(entry.total_points).toFixed(2)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-right text-sm text-[#6B7280] sm:table-cell">
                    {Number(entry.stage_points).toFixed(2)}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-sm text-[#6B7280] sm:table-cell">
                    {Number(entry.bonus_points).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-[#6B7280]">
        Punten zijn gewogen met de wortelregel — zie <a href="/spelregels" className="underline">spelregels</a>.
      </p>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">👑</span>;
  if (rank === 2) return <span className="font-bold text-[#C0C0C0]">2</span>;
  if (rank === 3) return <span className="font-bold text-[#CD7F32]">3</span>;
  return <span className="text-[#6B7280]">{rank}</span>;
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E5E0] bg-white p-12 text-center">
      <div className="mb-3 text-4xl">🚴</div>
      <p className="font-medium text-[#111827]">Nog geen deelnemers</p>
      <p className="mt-1 text-sm text-[#6B7280]">
        Het klassement verschijnt zodra deelnemers hun ploeg hebben ingevuld.
      </p>
    </div>
  );
}
