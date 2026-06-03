import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserDisplay } from "@/components/UserDisplay";

export const revalidate = 60;

type Pick = {
  bib_slot: number;
  rider_id: string;
  rider_name: string;
  bib_number: number;
  weighted_stage_points: number;
  weighted_bonus_points: number;
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Alle basis-data parallel ophalen
  const [
    klassementRes,
    profileRes,
    picksRes,
    verslagRes,
    messagesRes,
    lastStageRes,
  ] = await Promise.all([
    supabase.from("klassement").select("user_id, display_name, total_points, rank").order("rank"),
    supabase.from("profiles").select("id, display_name, nickname, avatar_id"),
    supabase.from("rider_score_detail").select("bib_slot, rider_id, rider_name, bib_number, weighted_stage_points, weighted_bonus_points").eq("user_id", user.id).order("bib_slot"),
    supabase.from("posts").select("id, title, content, created_at").order("created_at", { ascending: false }).limit(1),
    supabase.from("messages").select("id, user_id, content, created_at, profiles(display_name, nickname, avatar_id)").order("created_at", { ascending: false }).limit(3),
    supabase.from("stages").select("id, stage_number, stage_date, stage_type, departure, arrival").eq("status", "locked").order("stage_number", { ascending: false }).limit(1).single(),
  ]);

  const klassement = klassementRes.data ?? [];
  const allProfiles = profileRes.data ?? [];
  const profileMap: Record<string, { display_name: string; nickname: string | null; avatar_id: number | null }> = {};
  for (const p of allProfiles) profileMap[p.id] = { display_name: p.display_name, nickname: p.nickname ?? null, avatar_id: p.avatar_id ?? null };
  const profile = profileMap[user.id] ?? null;
  const picks = (picksRes.data ?? []) as Pick[];
  const latestPost = verslagRes.data?.[0] ?? null;
  const recentMessages = (messagesRes.data ?? []).reverse();
  const lastStage = lastStageRes.data ?? null;

  // Eigen rang
  const myEntry = klassement.find((e) => e.user_id === user.id);
  const myRank = myEntry ? Number(myEntry.rank) : null;

  // Mini klassement: eigen positie ±2
  const miniKlassement = myRank
    ? klassement.filter((e) => {
        const r = Number(e.rank);
        return r >= Math.max(1, myRank - 2) && r <= myRank + 2;
      })
    : klassement.slice(0, 5);

  const totalPoints = picks.reduce(
    (s, p) => s + Number(p.weighted_stage_points) + Number(p.weighted_bonus_points),
    0
  );

  const TYPE_LABEL: Record<string, string> = { rit: "Rit", ttt: "TTT", itt: "ITT" };

  // Delta klassement: vergelijk huidige rang met rang na vorige etappe met data
  const deltaMap: Record<string, number | null> = {};
  if (lastStage) {
    const { data: stageNums } = await supabase
      .from("cumulative_points")
      .select("stage_number")
      .lt("stage_number", lastStage.stage_number)
      .order("stage_number", { ascending: false })
      .limit(1);

    const prevStageNum = stageNums?.[0]?.stage_number ?? null;

    if (prevStageNum !== null) {
      const [{ data: currPoints }, { data: prevPoints }] = await Promise.all([
        supabase.from("cumulative_points").select("user_id, cumulative_points").eq("stage_number", lastStage.stage_number),
        supabase.from("cumulative_points").select("user_id, cumulative_points").eq("stage_number", prevStageNum),
      ]);

      const toRankMap = (pts: { user_id: string; cumulative_points: number }[]) => {
        const sorted = [...pts].sort((a, b) => Number(b.cumulative_points) - Number(a.cumulative_points));
        const map: Record<string, number> = {};
        sorted.forEach((r, i) => { map[r.user_id] = i + 1; });
        return map;
      };

      const currRankMap = toRankMap(currPoints ?? []);
      const prevRankMap = toRankMap(prevPoints ?? []);

      for (const entry of klassement) {
        const curr = currRankMap[entry.user_id];
        const prev = prevRankMap[entry.user_id];
        deltaMap[entry.user_id] = curr !== undefined && prev !== undefined ? prev - curr : null;
      }
    }
  }

  // Vorige etappe: punten per renner in die etappe voor de ingelogde user
  type StageRiderPoint = { rider_id: string; rider_name: string; bib_number: number; weighted: number };
  let myStagePoints = 0;
  let topStageRiders: StageRiderPoint[] = [];

  if (lastStage) {
    const [rawRes, pickCountRes, teamPickRes] = await Promise.all([
      supabase.from("stage_raw_points").select("rider_id, raw_points").eq("stage_id", lastStage.id),
      supabase.from("rider_pick_counts").select("rider_id, pick_count"),
      supabase.from("team_picks").select("rider_id, riders(id, full_name, bib_number)").eq("user_id", user.id),
    ]);

    const rawMap: Record<string, number> = {};
    for (const r of rawRes.data ?? []) rawMap[r.rider_id] = Number(r.raw_points);

    const pickCountMap: Record<string, number> = {};
    for (const p of pickCountRes.data ?? []) pickCountMap[p.rider_id] = Number(p.pick_count);

    for (const tp of teamPickRes.data ?? []) {
      const rider = tp.riders as { id: string; full_name: string; bib_number: number } | null;
      if (!rider) continue;
      const raw = rawMap[rider.id] ?? 0;
      const cnt = Math.max(pickCountMap[rider.id] ?? 1, 1);
      const weighted = raw / Math.sqrt(cnt);
      myStagePoints += weighted;
      if (weighted > 0) {
        topStageRiders.push({ rider_id: rider.id, rider_name: rider.full_name, bib_number: rider.bib_number, weighted });
      }
    }
    topStageRiders.sort((a, b) => b.weighted - a.weighted);
    topStageRiders = topStageRiders.slice(0, 3);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
        {profile && <div className="mt-1"><UserDisplay profile={profile} size="md" /></div>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Mini klassement */}
        <Link href="/klassement" className="group rounded-2xl border border-[#E2DFF0] bg-white p-5 shadow-sm hover:border-[#9462A6] transition">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Klassement</h2>
          {miniKlassement.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">Nog geen punten</p>
          ) : (
            <div className="space-y-2">
              {miniKlassement.map((e) => {
                const isMe = e.user_id === user.id;
                const delta = deltaMap[e.user_id];
                const p = profileMap[e.user_id] ?? { display_name: e.display_name, nickname: null, avatar_id: null };
                return (
                  <div key={e.user_id} className={`flex items-center gap-1.5 rounded-lg px-2 py-1 ${isMe ? "bg-[#EDE8F5]" : ""}`}>
                    <span className="w-4 shrink-0 text-center text-xs font-bold text-[#6B7280]">{e.rank}</span>
                    <MiniDelta delta={delta} />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <UserDisplay profile={p} size="sm" compact />
                    </div>
                    <span className={`text-sm font-semibold shrink-0 ${isMe ? "text-[#9462A6]" : "text-[#6B7280]"}`}>{Number(e.total_points).toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Link>

        {/* Vorige etappe */}
        <Link
          href={lastStage ? `/etappes/${lastStage.id}` : "/etappes"}
          className="group rounded-2xl border border-[#E2DFF0] bg-white p-5 shadow-sm hover:border-[#9462A6] transition"
        >
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Vorige etappe</h2>
          {!lastStage ? (
            <p className="text-sm text-[#9CA3AF]">Nog geen etappes gescoord</p>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#5760A6] px-2 py-0.5 text-xs font-bold text-white">
                    E{lastStage.stage_number}
                  </span>
                  <span className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-xs text-[#6B7280]">
                    {TYPE_LABEL[lastStage.stage_type] ?? lastStage.stage_type}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#9462A6]">{myStagePoints.toFixed(2)}</span>
                  <span className="ml-1 text-xs text-[#6B7280]">ptn</span>
                </div>
              </div>
              <p className="text-xs font-medium text-[#374151] mb-2">
                {lastStage.departure && lastStage.arrival
                  ? `${lastStage.departure} → ${lastStage.arrival}`
                  : "Route onbekend"}
              </p>
              {topStageRiders.length > 0 ? (
                <div className="space-y-1.5 border-t border-[#F3F4F6] pt-2 mt-2">
                  {topStageRiders.map((r) => (
                    <div key={r.rider_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-4 w-6 items-center justify-center rounded bg-[#EDE8F5] text-[9px] font-bold text-[#5760A6]">
                          {r.bib_number}
                        </span>
                        <span className="text-xs text-[#374151] truncate max-w-[120px]">{r.rider_name}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#9462A6]">+{r.weighted.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#9CA3AF] mt-1">Geen punten gescoord</p>
              )}
            </div>
          )}
        </Link>

        {/* Mijn ploeg */}
        <Link href="/mijn-team" className="group rounded-2xl border border-[#E2DFF0] bg-white p-5 shadow-sm hover:border-[#9462A6] transition">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Mijn ploeg</h2>
            {picks.length > 0 && (
              <span className="text-sm font-bold text-[#9462A6]">{totalPoints.toFixed(1)} ptn</span>
            )}
          </div>
          {picks.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">Nog geen ploeg samengesteld</p>
          ) : (
            <div className="space-y-1.5">
              {picks.map((p) => {
                const pts = Number(p.weighted_stage_points) + Number(p.weighted_bonus_points);
                return (
                  <div key={p.rider_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4 w-5 items-center justify-center rounded bg-[#5760A6] text-[9px] font-bold text-white">…{p.bib_slot}</span>
                      <span className="text-xs text-[#374151]">{p.rider_name}</span>
                    </div>
                    <span className="text-xs font-semibold text-[#111827]">{pts > 0 ? pts.toFixed(1) : "—"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Link>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Laatste verslag */}
        <Link
          href={latestPost ? `/verslagen/${latestPost.id}` : "/verslagen"}
          className="group rounded-2xl border border-[#E2DFF0] bg-white p-5 shadow-sm hover:border-[#9462A6] transition"
        >
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Laatste verslag</h2>
          {!latestPost ? (
            <p className="text-sm text-[#9CA3AF]">Nog geen verslagen geplaatst</p>
          ) : (
            <>
              <p className="font-semibold text-[#111827] group-hover:text-[#9462A6]">{latestPost.title}</p>
              <p className="mt-1 text-sm text-[#6B7280] line-clamp-2">{latestPost.content.slice(0, 120)}{latestPost.content.length > 120 ? "…" : ""}</p>
              <p className="mt-2 text-xs text-[#9CA3AF]">
                {new Date(latestPost.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}
              </p>
            </>
          )}
        </Link>

        {/* Laatste chatberichten */}
        <Link href="/chat" className="group rounded-2xl border border-[#E2DFF0] bg-white p-5 shadow-sm hover:border-[#9462A6] transition">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Chat</h2>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">Nog geen berichten</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => {
                const p = msg.profiles as { display_name: string; nickname?: string | null; avatar_id?: number | null } | null;
                const parts = (p?.display_name ?? "").trim().split(/\s+/);
                const initials =
                  (parts[0]?.[0] ?? "").toUpperCase() +
                  (parts.length > 1 ? (parts[parts.length - 1][0] ?? "").toUpperCase() : "");
                return (
                  <div key={msg.id} className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#5760A6]">
                        {p?.nickname
                          ? `${p.nickname} - ${initials}`
                          : (p?.display_name ?? "…")}
                      </p>
                      <p className="text-sm text-[#374151] truncate">{msg.content}</p>
                    </div>
                    <span className="shrink-0 text-xs text-[#9CA3AF]">
                      {new Date(msg.created_at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}

function MiniDelta({ delta }: { delta: number | null | undefined }) {
  if (delta === null || delta === undefined)
    return <span className="w-4 shrink-0 text-center text-xs text-[#D1D5DB]">—</span>;
  if (delta > 0)
    return <span className="w-4 shrink-0 text-center text-xs font-bold text-green-500">↑</span>;
  if (delta < 0)
    return <span className="w-4 shrink-0 text-center text-xs font-bold text-red-500">↓</span>;
  return <span className="w-4 shrink-0 text-center text-xs text-[#D1D5DB]">—</span>;
}
