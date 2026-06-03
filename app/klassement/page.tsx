import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

  const { data: config } = await supabase
    .from("config")
    .select("value")
    .eq("key", "registration_deadline")
    .single();

  const deadline = config ? new Date(config.value) : null;
  const registrationClosed = deadline ? new Date() >= deadline : false;

  const lockedStages = stages?.filter((s) => s.status === "locked") ?? [];
  const lockedCount = lockedStages.length;
  const totalStages = stages?.length ?? 21;

  // Feature 4: stijgers/dalers — vergelijk huidige rang met rang na vorige etappe
  type DeltaMap = Record<string, number | null>;
  let deltaMap: DeltaMap = {};
  if (lockedCount >= 2) {
    const maxStage = Math.max(...lockedStages.map((s) => s.stage_number));
    const prevStage = maxStage - 1;
    const { data: prevPoints } = await supabase
      .from("cumulative_points")
      .select("user_id, cumulative_points")
      .eq("stage_number", prevStage);

    if (prevPoints && prevPoints.length > 0) {
      // Rang berekenen op basis van vorige etappe
      const sorted = [...prevPoints].sort(
        (a, b) => Number(b.cumulative_points) - Number(a.cumulative_points)
      );
      const prevRankMap: Record<string, number> = {};
      sorted.forEach((row, i) => {
        prevRankMap[row.user_id] = i + 1;
      });
      for (const entry of klassement ?? []) {
        const prev = prevRankMap[entry.user_id];
        if (prev !== undefined) {
          deltaMap[entry.user_id] = prev - entry.rank; // positief = gestegen
        } else {
          deltaMap[entry.user_id] = null;
        }
      }
    }
  }

  // Feature 5: top 10 renners met meeste ruwe punten
  type TopRider = {
    rider_id: string;
    full_name: string;
    bib_number: number;
    team_name: string;
    total_raw: number;
    pick_count: number;
  };
  let topRiders: TopRider[] = [];
  if (lockedCount > 0) {
    const { data: rawPoints } = await supabase
      .from("stage_raw_points")
      .select("rider_id, raw_points");

    if (rawPoints && rawPoints.length > 0) {
      const totals: Record<string, number> = {};
      for (const row of rawPoints) {
        totals[row.rider_id] = (totals[row.rider_id] ?? 0) + Number(row.raw_points);
      }
      const topIds = Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);

      const { data: riderData } = await supabase
        .from("riders")
        .select("id, full_name, bib_number, team_name");

      const { data: pickCounts } = await supabase
        .from("rider_pick_counts")
        .select("rider_id, pick_count");

      const pickMap: Record<string, number> = {};
      for (const p of pickCounts ?? []) {
        pickMap[p.rider_id] = Number(p.pick_count);
      }

      topRiders = topIds
        .map((id) => {
          const r = riderData?.find((x) => x.id === id);
          if (!r) return null;
          return {
            rider_id: id,
            full_name: r.full_name,
            bib_number: r.bib_number,
            team_name: r.team_name,
            total_raw: totals[id],
            pick_count: pickMap[id] ?? 0,
          };
        })
        .filter(Boolean) as TopRider[];
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Klassement</h1>
          <p className="mt-1 text-[#6B7280]">
            {lockedCount === 0
              ? "De Tour is nog niet begonnen"
              : `Na ${lockedCount} van ${totalStages} etappes`}
          </p>
        </div>
        <div className="rounded-xl bg-[#EDE8F5] px-4 py-2 text-center">
          <div className="text-2xl font-bold text-[#5760A6]">{lockedCount}</div>
          <div className="text-xs text-[#6B7280]">etappes</div>
        </div>
      </div>

      {registrationClosed && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#EDE8F5] px-4 py-2.5 text-sm text-[#5760A6]">
          <span>👥</span>
          <span>Registratie gesloten — klik op een naam om de ploeg te bekijken</span>
        </div>
      )}

      {!klassement || klassement.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2DFF0] bg-[#F3F1FA]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Deelnemer
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Punten
                </th>
                {lockedCount >= 2 && (
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Trend
                  </th>
                )}
                <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">
                  Etappes
                </th>
                <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">
                  Bonus
                </th>
              </tr>
            </thead>
            <tbody>
              {klassement.map((entry, i) => {
                const delta = deltaMap[entry.user_id];
                return (
                  <tr
                    key={entry.user_id}
                    className={`border-b border-[#F3F4F6] transition hover:bg-[#F8F7FC] ${
                      i === 0 ? "bg-[#FFFBEB]" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <RankBadge rank={entry.rank} />
                    </td>
                    <td className="px-4 py-3">
                      {registrationClosed ? (
                        <Link
                          href={`/deelnemers/${entry.user_id}`}
                          className="font-medium text-[#111827] hover:text-[#9462A6] hover:underline"
                        >
                          {entry.display_name}
                        </Link>
                      ) : (
                        <span className="font-medium text-[#111827]">
                          {entry.display_name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-lg font-bold text-[#111827]">
                        {Number(entry.total_points).toFixed(2)}
                      </span>
                    </td>
                    {lockedCount >= 2 && (
                      <td className="px-4 py-3 text-right">
                        <DeltaBadge delta={delta} />
                      </td>
                    )}
                    <td className="hidden px-4 py-3 text-right text-sm text-[#6B7280] sm:table-cell">
                      {Number(entry.stage_points).toFixed(2)}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-sm text-[#6B7280] sm:table-cell">
                      {Number(entry.bonus_points).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {topRiders.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-[#111827]">Top 10 renners</h2>
          <div className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2DFF0] bg-[#F3F1FA]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Renner</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">Ploeg</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Punten</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Gekozen</th>
                </tr>
              </thead>
              <tbody>
                {topRiders.map((rider, i) => (
                  <tr key={rider.rider_id} className="border-b border-[#F3F4F6] transition hover:bg-[#F8F7FC]">
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-8 items-center justify-center rounded bg-[#5760A6] text-xs font-bold text-white">
                          {rider.bib_number}
                        </span>
                        <Link
                          href={`/renners/${rider.rider_id}`}
                          className="font-medium text-[#111827] hover:text-[#9462A6] hover:underline"
                        >
                          {rider.full_name}
                        </Link>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-[#6B7280] sm:table-cell">
                      {rider.team_name}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#111827]">
                      {rider.total_raw.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#6B7280]">
                      {rider.pick_count}×
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[#6B7280]">Ruwe punten vóór wortelweging — renners met veel picks leveren individueel minder op.</p>
        </div>
      )}

      <p className="mt-4 text-xs text-[#6B7280]">
        Punten zijn gewogen met de wortelregel — zie{" "}
        <a href="/spelregels" className="underline">
          spelregels
        </a>
        .
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

function DeltaBadge({ delta }: { delta: number | null | undefined }) {
  if (delta === null || delta === undefined) return <span className="text-[#9CA3AF]">—</span>;
  if (delta > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-green-600">
        ▲ {delta}
      </span>
    );
  if (delta < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-red-500">
        ▼ {Math.abs(delta)}
      </span>
    );
  return <span className="text-sm text-[#9CA3AF]">—</span>;
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#E2DFF0] bg-white p-12 text-center">
      <div className="mb-3 text-4xl">🚴</div>
      <p className="font-medium text-[#111827]">Nog geen deelnemers</p>
      <p className="mt-1 text-sm text-[#6B7280]">
        Het klassement verschijnt zodra deelnemers hun ploeg hebben ingevuld.
      </p>
    </div>
  );
}
