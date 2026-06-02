import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const revalidate = 60;

export default async function DeelnemerPage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Controleer of registratie gesloten is
  const { data: config } = await supabase
    .from("config")
    .select("value")
    .eq("key", "registration_deadline")
    .single();

  const deadline = config ? new Date(config.value) : null;
  const isOpen = deadline ? new Date() < deadline : true;

  // Eigen team altijd toegankelijk; andermans team alleen na deadline
  if (isOpen && user_id !== user.id) {
    redirect("/klassement");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("id", user_id)
    .single();

  if (!profile) notFound();

  const { data: picks } = await supabase
    .from("rider_score_detail")
    .select("*")
    .eq("user_id", user_id)
    .order("bib_slot", { ascending: true });

  const totalPoints = picks
    ? picks.reduce(
        (sum, p) =>
          sum + Number(p.weighted_stage_points) + Number(p.weighted_bonus_points),
        0
      )
    : 0;

  const isOwnTeam = user_id === user.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/klassement"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827]"
      >
        ← Terug naar klassement
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            {isOwnTeam ? "Mijn ploeg" : `Ploeg van ${profile.display_name}`}
          </h1>
          {!isOwnTeam && (
            <p className="mt-1 text-[#6B7280]">{profile.display_name}</p>
          )}
        </div>
        {picks && picks.length > 0 && (
          <div className="rounded-xl bg-[#1A1A1A] px-5 py-3 text-center">
            <div className="text-2xl font-bold text-[#FFD700]">
              {totalPoints.toFixed(2)}
            </div>
            <div className="text-xs text-white/60">punten totaal</div>
          </div>
        )}
      </div>

      {!picks || picks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E5E5E0] bg-white p-12 text-center">
          <div className="mb-3 text-4xl">🚴</div>
          <p className="text-[#6B7280]">
            {isOwnTeam
              ? "Je hebt nog geen ploeg samengesteld."
              : `${profile.display_name} heeft geen ploeg ingevuld.`}
          </p>
          {isOwnTeam && (
            <Link
              href="/registratie"
              className="mt-4 inline-block rounded-xl bg-[#1A1A1A] px-6 py-2.5 text-sm font-semibold text-[#FFD700] hover:bg-[#333]"
            >
              Ploeg samenstellen →
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E0] bg-[#F9F9F7]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Slot
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Renner
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">
                  Ploeg
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Gekozen door
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Punten
                </th>
              </tr>
            </thead>
            <tbody>
              {picks.map((pick) => {
                const total =
                  Number(pick.weighted_stage_points) +
                  Number(pick.weighted_bonus_points);
                return (
                  <tr key={pick.rider_id} className="border-b border-[#F3F4F6]">
                    <td className="px-4 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-bold text-[#FFD700]">
                        …{pick.bib_slot}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/renners/${pick.rider_id}`}
                        className="font-medium text-[#111827] hover:text-[#00A651] hover:underline"
                      >
                        {pick.rider_name}
                      </Link>
                      <p className="text-xs text-[#6B7280]">#{pick.bib_number}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-[#6B7280] sm:table-cell">
                      {pick.team_name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/renners/${pick.rider_id}`}
                        className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#374151] hover:bg-[#E5E7EB]"
                      >
                        {pick.pick_count}×
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-[#111827]">
                        {total.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#F9F9F7]">
                <td
                  colSpan={4}
                  className="px-4 py-3 text-right text-sm font-semibold text-[#374151]"
                >
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
        <Link href="/spelregels" className="underline">
          spelregels
        </Link>
        .
      </p>
    </div>
  );
}
