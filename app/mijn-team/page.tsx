import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RegistratieForm } from "@/app/registratie/RegistratieForm";
import { ProfileEditor } from "./ProfileEditor";
import { JokerPicker } from "./JokerPicker";
import { UserDisplay } from "@/components/UserDisplay";

export const revalidate = 0;

type Pick = {
  bib_slot: number;
  rider_id: string;
  rider_name: string;
  bib_number: number;
  team_name: string;
  pick_count: number;
  weighted_stage_points: number;
  weighted_bonus_points: number;
};

export default async function MijnTeamPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Deadline check
  const { data: config } = await supabase
    .from("config")
    .select("value")
    .eq("key", "registration_deadline")
    .single();

  const deadline = config ? new Date(config.value) : null;
  const isOpen = deadline ? new Date() < deadline : true;

  // Eigen profiel
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, nickname, avatar_id")
    .eq("id", user.id)
    .single();

  // Bezette bijnamen (alle andere gebruikers)
  const { data: takenProfiles } = await supabase
    .from("profiles")
    .select("nickname")
    .neq("id", user.id)
    .not("nickname", "is", null);

  const takenNicknames = (takenProfiles ?? [])
    .map((p) => p.nickname)
    .filter(Boolean) as string[];

  // Eigen picks + scores
  const { data: rawPicks } = await supabase
    .from("rider_score_detail")
    .select("bib_slot, rider_id, rider_name, bib_number, team_name, pick_count, weighted_stage_points, weighted_bonus_points")
    .eq("user_id", user.id)
    .order("bib_slot", { ascending: true });

  const picks = (rawPicks ?? []) as Pick[];
  const totalPoints = picks.reduce(
    (sum, p) => sum + Number(p.weighted_stage_points) + Number(p.weighted_bonus_points),
    0
  );

  // Riders voor het form (enkel vóór deadline nodig)
  let riders: Array<{ id: string; bib_number: number; bib_digit: number; full_name: string; team_name: string; nationality: string | null; is_dns: boolean; is_dnf: boolean }> = [];
  let currentPicks: Array<{ bib_slot: number; rider_id: string; riders: { id: string; full_name: string; team_name: string; bib_number: number; nationality: string | null } | null }> = [];

  // Joker picks + etappes voor de picker
  let jokerStages: { stage_number: number; stage_type: string; profile: string; departure: string | null; arrival: string | null; distance_km: number | null }[] = [];
  let jokerPick: number | null = null;

  if (isOpen) {
    const { data: allRiders } = await supabase
      .from("riders")
      .select("id, bib_number, bib_digit, full_name, team_name, nationality, is_dns, is_dnf")
      .eq("is_dns", false)
      .order("bib_number", { ascending: true });
    riders = allRiders ?? [];

    const { data: existingPicks } = await supabase
      .from("team_picks")
      .select("bib_slot, rider_id, riders(id, full_name, team_name, bib_number, nationality)")
      .eq("user_id", user.id)
      .order("bib_slot", { ascending: true });
    currentPicks = (existingPicks ?? []) as typeof currentPicks;

    // Etappes voor joker picker
    const { data: stages } = await supabase
      .from("stages")
      .select("stage_number, stage_type, profile, departure, arrival, distance_km")
      .order("stage_number", { ascending: true });
    jokerStages = (stages ?? []) as typeof jokerStages;

    // Bestaande joker pick (max 1)
    const { data: existingJokers } = await supabase
      .from("joker_picks")
      .select("stage_number")
      .eq("user_id", user.id)
      .limit(1);
    jokerPick = existingJokers?.[0]?.stage_number ?? null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Mijn ploeg</h1>
          {profile && (
            <div className="mt-2">
              <UserDisplay profile={profile} size="md" />
            </div>
          )}
        </div>
        {picks.length > 0 && (
          <div className="rounded-xl border border-[#E2DFF0] bg-white px-5 py-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#9462A6]">{totalPoints.toFixed(2)}</div>
            <div className="text-xs text-[#6B7280]">punten totaal</div>
          </div>
        )}
      </div>

      {/* Profiel editor */}
      <ProfileEditor
        userId={user.id}
        currentAvatarId={profile?.avatar_id ?? 1}
        currentNickname={profile?.nickname ?? null}
        takenNicknames={takenNicknames}
      />

      {/* Vóór deadline: ploeg samenstellen */}
      {isOpen && (
        <div className="mb-8">
          <div className="mb-4 rounded-xl bg-[#EDE8F5] px-4 py-3 text-sm text-[#5760A6]">
            ⏰ Registratie open{deadline && ` t/m ${deadline.toLocaleString("nl-NL", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}`}
          </div>
          <RegistratieForm
            riders={riders}
            currentPicks={currentPicks}
            userId={user.id}
          />
          {jokerStages.length > 0 && (
            <div className="mt-6">
              <JokerPicker
                userId={user.id}
                stages={jokerStages}
                currentPick={jokerPick}
              />
            </div>
          )}
        </div>
      )}

      {/* Na deadline: teamweergave met punten */}
      {!isOpen && (
        <>
          {picks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E2DFF0] bg-white p-12 text-center">
              <div className="mb-3 text-4xl">🚴</div>
              <p className="text-[#6B7280]">Je hebt geen ploeg ingevuld voor de deadline.</p>
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
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5760A6] text-xs font-bold text-white">
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
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#374151]">
                            {pick.pick_count}×
                          </span>
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
        </>
      )}
    </div>
  );
}
