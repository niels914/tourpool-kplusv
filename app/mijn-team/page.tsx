import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const revalidate = 60;

export default async function MijnTeamPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: picks } = await supabase
    .from("rider_score_detail")
    .select("*")
    .eq("user_id", user.id)
    .order("bib_slot", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const totalPoints = picks
    ? picks.reduce((sum, p) => sum + Number(p.weighted_stage_points) + Number(p.weighted_bonus_points), 0)
    : 0;

  const hasPicks = picks && picks.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Mijn ploeg</h1>
          {profile && (
            <p className="mt-1 text-[#6B7280]">{profile.display_name}</p>
          )}
        </div>
        {hasPicks && (
          <div className="rounded-xl bg-[#1A1A1A] px-5 py-3 text-center">
            <div className="text-2xl font-bold text-[#FFD700]">
              {totalPoints.toFixed(2)}
            </div>
            <div className="text-xs text-white/60">punten totaal</div>
          </div>
        )}
      </div>

      {!hasPicks ? (
        <div className="rounded-2xl border border-dashed border-[#E5E5E0] bg-white p-12 text-center">
          <div className="mb-3 text-4xl">🚴</div>
          <p className="font-medium text-[#111827]">Je hebt nog geen ploeg samengesteld</p>
          <Link
            href="/registratie"
            className="mt-4 inline-block rounded-xl bg-[#1A1A1A] px-6 py-2.5 text-sm font-semibold text-[#FFD700] hover:bg-[#333]"
          >
            Ploeg samenstellen →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E0] bg-[#F9F9F7]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Slot</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Renner</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">Ploeg</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  <span title="Aantal deelnemers met deze renner">Gekozen door</span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Punten</th>
              </tr>
            </thead>
            <tbody>
              {picks.map((pick) => {
                const totalRiderPoints = Number(pick.weighted_stage_points) + Number(pick.weighted_bonus_points);
                return (
                  <tr key={pick.rider_id} className="border-b border-[#F3F4F6]">
                    <td className="px-4 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-bold text-[#FFD700]">
                        …{pick.bib_slot}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#111827]">{pick.rider_name}</p>
                      <p className="text-xs text-[#6B7280]">#{pick.bib_number}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-[#6B7280] sm:table-cell">
                      {pick.team_name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#374151]">
                        {pick.pick_count} · √{Math.sqrt(pick.pick_count).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-[#111827]">
                        {totalRiderPoints.toFixed(2)}
                      </span>
                      {Number(pick.weighted_bonus_points) > 0 && (
                        <span className="ml-1 text-xs text-[#FFD700]">
                          +{Number(pick.weighted_bonus_points).toFixed(2)} bonus
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#F9F9F7]">
                <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-[#374151]">
                  Totaal
                </td>
                <td className="px-4 py-3 text-right text-lg font-bold text-[#111827]">
                  {totalPoints.toFixed(2)}
                </td>
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
