import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const revalidate = 60;

type Pick = {
  rider_id: string;
  rider_name: string;
  bib_number: number;
  team_name: string;
  bib_slot: number;
  pick_count: number;
  weighted_stage_points: number;
  weighted_bonus_points: number;
};

export default async function DeelnemerPage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: config } = await supabase
    .from("config")
    .select("value")
    .eq("key", "registration_deadline")
    .single();

  const deadline = config ? new Date(config.value) : null;
  const isOpen = deadline ? new Date() < deadline : true;

  if (isOpen && user_id !== user.id) {
    redirect("/klassement");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("id", user_id)
    .single();

  if (!profile) notFound();

  const isOwnTeam = user_id === user.id;

  // Picks van de bekeken deelnemer
  const { data: rawPicks } = await supabase
    .from("rider_score_detail")
    .select("*")
    .eq("user_id", user_id)
    .order("bib_slot", { ascending: true });

  const picks = (rawPicks ?? []) as Pick[];

  const totalPoints = picks.reduce(
    (sum, p) => sum + Number(p.weighted_stage_points) + Number(p.weighted_bonus_points),
    0
  );

  // Bij andermans team: ook eigen picks ophalen voor vergelijking
  let ownPicks: Pick[] = [];
  let ownTotal = 0;
  if (!isOwnTeam) {
    const { data: rawOwn } = await supabase
      .from("rider_score_detail")
      .select("*")
      .eq("user_id", user.id)
      .order("bib_slot", { ascending: true });
    ownPicks = (rawOwn ?? []) as Pick[];
    ownTotal = ownPicks.reduce(
      (sum, p) => sum + Number(p.weighted_stage_points) + Number(p.weighted_bonus_points),
      0
    );
  }

  // ── Eigen team weergave ────────────────────────────────────────────────────
  if (isOwnTeam) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link
          href="/klassement"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827]"
        >
          ← Terug naar klassement
        </Link>

        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Mijn ploeg</h1>
          {picks.length > 0 && (
            <div className="rounded-xl bg-[#1A1A1A] px-5 py-3 text-center">
              <div className="text-2xl font-bold text-[#FFD700]">
                {totalPoints.toFixed(2)}
              </div>
              <div className="text-xs text-white/60">punten totaal</div>
            </div>
          )}
        </div>

        {picks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E2DFF0] bg-white p-12 text-center">
            <div className="mb-3 text-4xl">🚴</div>
            <p className="text-[#6B7280]">Je hebt nog geen ploeg samengesteld.</p>
            <Link
              href="/registratie"
              className="mt-4 inline-block rounded-xl bg-[#1A1A1A] px-6 py-2.5 text-sm font-semibold text-[#FFD700] hover:bg-[#333]"
            >
              Ploeg samenstellen →
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2DFF0] bg-[#F3F1FA]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Slot</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Renner</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">Ploeg</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Gekozen door</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Punten</th>
                </tr>
              </thead>
              <tbody>
                {picks.map((pick) => {
                  const total = Number(pick.weighted_stage_points) + Number(pick.weighted_bonus_points);
                  return (
                    <tr key={pick.rider_id} className="border-b border-[#F3F4F6]">
                      <td className="px-4 py-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-bold text-[#FFD700]">
                          …{pick.bib_slot}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/renners/${pick.rider_id}`} className="font-medium text-[#111827] hover:text-[#9462A6] hover:underline">
                          {pick.rider_name}
                        </Link>
                        <p className="text-xs text-[#6B7280]">#{pick.bib_number}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-[#6B7280] sm:table-cell">{pick.team_name}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/renners/${pick.rider_id}`} className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#374151] hover:bg-[#E5E7EB]">
                          {pick.pick_count}×
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#111827]">
                        {total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#F3F1FA]">
                  <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-[#374151]">Totaal</td>
                  <td className="px-4 py-3 text-right text-lg font-bold text-[#111827]">{totalPoints.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-[#6B7280]">
          Punten zijn gewogen met de wortelregel (÷ √deelnemers). Zie{" "}
          <Link href="/spelregels" className="underline">spelregels</Link>.
        </p>
      </div>
    );
  }

  // ── Vergelijkingsweergave ──────────────────────────────────────────────────
  const ownBySlot = Object.fromEntries(ownPicks.map((p) => [p.bib_slot, p]));
  const slots = [1, 2, 3, 4, 5, 6, 7, 8];

  // Haal ook de naam van de inlogger op voor de kolomheader
  const { data: ownProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const ownName = ownProfile?.display_name ?? "Jouw ploeg";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/klassement"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827]"
      >
        ← Terug naar klassement
      </Link>

      {/* Scorebalk */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          Vergelijking
        </h1>
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl border border-[#E2DFF0] bg-white px-4 py-3 text-center sm:min-w-[140px]">
            <div className={`text-xl font-bold ${ownTotal > totalPoints ? "text-[#9462A6]" : "text-[#1A1A1A]"}`}>
              {ownTotal.toFixed(2)}
            </div>
            <div className="truncate text-xs text-[#6B7280]">{ownName}</div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#6B7280]">vs</div>
          <div className="flex-1 rounded-xl border border-[#E2DFF0] bg-white px-4 py-3 text-center sm:min-w-[140px]">
            <div className={`text-xl font-bold ${totalPoints > ownTotal ? "text-[#9462A6]" : "text-[#1A1A1A]"}`}>
              {totalPoints.toFixed(2)}
            </div>
            <div className="truncate text-xs text-[#6B7280]">{profile.display_name}</div>
          </div>
        </div>
      </div>

      {/* Vergelijkingstabel */}
      <div className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
        {/* Headers */}
        <div className="grid grid-cols-[2.5rem_1fr_5rem_2.5rem_1fr_5rem] gap-0 border-b border-[#E2DFF0] bg-[#F3F1FA] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          <div></div>
          <div>{ownName}</div>
          <div className="text-right">Punten</div>
          <div></div>
          <div>{profile.display_name}</div>
          <div className="text-right">Punten</div>
        </div>

        {slots.map((slot) => {
          const own = ownBySlot[slot];
          const their = picks.find((p) => p.bib_slot === slot);
          const ownPts = own ? Number(own.weighted_stage_points) + Number(own.weighted_bonus_points) : 0;
          const theirPts = their ? Number(their.weighted_stage_points) + Number(their.weighted_bonus_points) : 0;
          const ownWins = ownPts > theirPts;
          const theirWins = theirPts > ownPts;

          return (
            <div
              key={slot}
              className="grid grid-cols-[2.5rem_1fr_5rem_2.5rem_1fr_5rem] items-center gap-0 border-b border-[#F3F4F6] px-4 py-3 last:border-0"
            >
              {/* Slot badge */}
              <div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-bold text-[#FFD700]">
                  …{slot}
                </span>
              </div>

              {/* Eigen renner */}
              <div className={`rounded-lg px-2 py-1 ${ownWins ? "bg-[#EDE8F5]" : ""}`}>
                {own ? (
                  <>
                    <Link
                      href={`/renners/${own.rider_id}`}
                      className="block text-sm font-medium text-[#111827] hover:text-[#9462A6] hover:underline"
                    >
                      {own.rider_name}
                    </Link>
                    <span className="text-xs text-[#6B7280]">#{own.bib_number}</span>
                  </>
                ) : (
                  <span className="text-sm text-[#9CA3AF] italic">Geen renner</span>
                )}
              </div>

              {/* Eigen punten */}
              <div className={`text-right text-sm font-bold ${ownWins ? "text-[#9462A6]" : "text-[#374151]"}`}>
                {ownPts > 0 ? ownPts.toFixed(2) : "—"}
              </div>

              {/* vs */}
              <div className="text-center text-xs text-[#D1D5DB]">vs</div>

              {/* Hun renner */}
              <div className={`rounded-lg px-2 py-1 ${theirWins ? "bg-[#EDE8F5]" : ""}`}>
                {their ? (
                  <>
                    <Link
                      href={`/renners/${their.rider_id}`}
                      className="block text-sm font-medium text-[#111827] hover:text-[#9462A6] hover:underline"
                    >
                      {their.rider_name}
                    </Link>
                    <span className="text-xs text-[#6B7280]">#{their.bib_number}</span>
                  </>
                ) : (
                  <span className="text-sm text-[#9CA3AF] italic">Geen renner</span>
                )}
              </div>

              {/* Hun punten */}
              <div className={`text-right text-sm font-bold ${theirWins ? "text-[#9462A6]" : "text-[#374151]"}`}>
                {theirPts > 0 ? theirPts.toFixed(2) : "—"}
              </div>
            </div>
          );
        })}

        {/* Totaalrij */}
        <div className="grid grid-cols-[2.5rem_1fr_5rem_2.5rem_1fr_5rem] items-center gap-0 border-t-2 border-[#E2DFF0] bg-[#F3F1FA] px-4 py-3">
          <div></div>
          <div className="text-sm font-semibold text-[#374151]">Totaal</div>
          <div className={`text-right text-base font-bold ${ownTotal > totalPoints ? "text-[#9462A6]" : "text-[#111827]"}`}>
            {ownTotal.toFixed(2)}
          </div>
          <div></div>
          <div className="text-sm font-semibold text-[#374151]">Totaal</div>
          <div className={`text-right text-base font-bold ${totalPoints > ownTotal ? "text-[#9462A6]" : "text-[#111827]"}`}>
            {totalPoints.toFixed(2)}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-[#6B7280]">
        Groen gemarkeerd = meer punten in dit slot. Punten zijn gewogen met de wortelregel. Zie{" "}
        <Link href="/spelregels" className="underline">spelregels</Link>.
      </p>
    </div>
  );
}
