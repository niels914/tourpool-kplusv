import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UserDisplay } from "@/components/UserDisplay";
import { PuntenGrafiek } from "./PuntenGrafiek";

export const revalidate = 60;

export default async function KlassementPage() {
  const supabase = await createClient();

  const { data: klassement } = await supabase
    .from("klassement")
    .select("user_id, display_name, total_points, stage_points, bonus_points, rank")
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

  // Stijgers/dalers — vergelijk huidige rang met rang na vorige etappe met data
  type DeltaMap = Record<string, number | null>;
  let deltaMap: DeltaMap = {};
  if (lockedCount >= 1) {
    const maxStage = Math.max(...lockedStages.map((s) => s.stage_number));

    // Zoek de laatste stage met data in de view (maxStage zelf voor huidig,
    // de op-één-na-hoogste voor vergelijking — sla lege etappes over)
    const { data: stageNums } = await supabase
      .from("cumulative_points")
      .select("stage_number")
      .lt("stage_number", maxStage)
      .order("stage_number", { ascending: false })
      .limit(1);

    const prevStageNum = stageNums?.[0]?.stage_number ?? null;

    if (prevStageNum !== null) {
      // Huidig en vorig klassement ophalen
      const [{ data: currPoints }, { data: prevPoints }] = await Promise.all([
        supabase.from("cumulative_points").select("user_id, cumulative_points").eq("stage_number", maxStage),
        supabase.from("cumulative_points").select("user_id, cumulative_points").eq("stage_number", prevStageNum),
      ]);

      const rank = (pts: { user_id: string; cumulative_points: number }[]) => {
        const sorted = [...pts].sort((a, b) => Number(b.cumulative_points) - Number(a.cumulative_points));
        const map: Record<string, number> = {};
        sorted.forEach((r, i) => { map[r.user_id] = i + 1; });
        return map;
      };

      const currRankMap = rank(currPoints ?? []);
      const prevRankMap = rank(prevPoints ?? []);

      for (const entry of klassement ?? []) {
        const curr = currRankMap[entry.user_id];
        const prev = prevRankMap[entry.user_id];
        if (curr !== undefined && prev !== undefined) {
          deltaMap[entry.user_id] = prev - curr; // positief = gestegen
        } else {
          deltaMap[entry.user_id] = null;
        }
      }
    }
  }

  // Profiles voor UserDisplay + grafiek labels
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, nickname, avatar_id");
  const profileMap: Record<string, { display_name: string; nickname: string | null; avatar_id: number | null }> = {};
  for (const p of profiles ?? []) {
    profileMap[p.id] = { display_name: p.display_name, nickname: p.nickname ?? null, avatar_id: p.avatar_id ?? null };
  }

  // Puntenverloop voor grafiek (alle vergrendelde etappes)
  let grafiekData: { stage_number: number; user_id: string; cumulative_points: number }[] = [];
  if (lockedCount > 0) {
    const { data: cumulPoints } = await supabase
      .from("cumulative_points")
      .select("user_id, stage_number, cumulative_points")
      .order("stage_number", { ascending: true });
    grafiekData = (cumulPoints ?? []).map((r) => ({
      stage_number: r.stage_number,
      user_id: r.user_id,
      cumulative_points: Number(r.cumulative_points),
    }));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Klassement</h1>
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
                {lockedCount >= 1 && (
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
                const isLast = i === klassement.length - 1 && klassement.length > 3;
                return (
                  <tr
                    key={entry.user_id}
                    className={`border-b border-[#F3F4F6] transition hover:bg-[#F8F7FC] ${
                      i === 0 ? "bg-[#EDE8F5]" : isLast ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <RankBadge rank={entry.rank} isLast={isLast} />
                    </td>
                    <td className="px-4 py-3">
                      {registrationClosed ? (
                        <Link href={`/deelnemers/${entry.user_id}`} className="hover:opacity-80">
                          <UserDisplay profile={profileMap[entry.user_id] ?? { display_name: entry.display_name }} size="sm" />
                        </Link>
                      ) : (
                        <UserDisplay profile={profileMap[entry.user_id] ?? { display_name: entry.display_name }} size="sm" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-lg font-bold text-[#111827]">
                        {Number(entry.total_points).toFixed(2)}
                      </span>
                    </td>
                    {lockedCount >= 1 && (
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

      {grafiekData.length > 0 && (
        <PuntenGrafiek
          data={grafiekData}
          profiles={(profiles ?? []).map((p) => ({
            user_id: p.id,
            display_name: p.display_name,
            nickname: p.nickname ?? null,
            avatar_id: p.avatar_id ?? null,
          }))}
        />
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

function RankBadge({ rank, isLast }: { rank: number; isLast?: boolean }) {
  if (rank === 1) return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5760A6] text-xs font-bold text-white">1</span>;
  if (rank === 2) return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#9462A6] text-xs font-bold text-white">2</span>;
  if (rank === 3) return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#B8AED6] text-xs font-bold text-white">3</span>;
  if (isLast) return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white" title="Rode lantaarn">🔴</span>;
  return <span className="text-[#6B7280]">{rank}</span>;
}

function DeltaBadge({ delta }: { delta: number | null | undefined }) {
  if (delta === null || delta === undefined)
    return <span className="text-sm text-[#D1D5DB]">—</span>;
  if (delta > 0)
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-600">
        ↑ {delta}
      </span>
    );
  if (delta < 0)
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-500">
        ↓ {Math.abs(delta)}
      </span>
    );
  return <span className="text-sm text-[#D1D5DB]">—</span>;
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
