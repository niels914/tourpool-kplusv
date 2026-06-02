import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const revalidate = 60;

export default async function RennerDetailPage({
  params,
}: {
  params: Promise<{ rider_id: string }>;
}) {
  const { rider_id } = await params;
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

  // Rennergegevens
  const { data: rider } = await supabase
    .from("riders")
    .select("*")
    .eq("id", rider_id)
    .single();

  if (!rider) notFound();

  // Wie heeft deze renner gekozen? Alleen zichtbaar na deadline
  let pickers: Array<{ user_id: string; display_name: string }> = [];
  if (!isOpen) {
    const { data: picks } = await supabase
      .from("team_picks")
      .select("user_id, profiles(display_name)")
      .eq("rider_id", rider_id);

    pickers = (picks ?? []).map((p) => ({
      user_id: p.user_id,
      display_name:
        (p.profiles as unknown as { display_name: string } | null)?.display_name ?? "—",
    }));
  }

  // Punten die deze renner heeft opgeleverd (per etappe, vergrendelde etappes)
  const { data: stageResults } = await supabase
    .from("stage_results")
    .select("position, result_type, stages(stage_number, stage_date, status)")
    .eq("rider_id", rider_id)
    .order("stage_id", { ascending: true });

  const lockedResults = (stageResults ?? []).filter(
    (r) => (r.stages as unknown as { status: string } | null)?.status === "locked"
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/renners"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827]"
      >
        ← Alle renners
      </Link>

      {/* Renner header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1A1A1A]">
          <span className="text-lg font-bold text-[#FFD700]">
            {rider.bib_number}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            {rider.full_name}
          </h1>
          <p className="mt-1 text-[#6B7280]">
            {rider.team_name}
            {rider.nationality && ` · ${rider.nationality}`}
            {" · "}slot …{rider.bib_digit}
          </p>
          <div className="mt-2 flex gap-2">
            {rider.is_dns && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                DNS — niet gestart
              </span>
            )}
            {rider.is_dnf && (
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                DNF — uitgevallen
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Wie koos deze renner */}
      <section className="mb-8">
        <h2 className="mb-3 border-l-4 border-[#FFD700] pl-3 text-xl font-bold text-[#1A1A1A]">
          Gekozen door
        </h2>

        {isOpen ? (
          <div className="rounded-xl border border-dashed border-[#E5E5E0] bg-white p-6 text-center text-sm text-[#6B7280]">
            <span className="text-2xl">🔒</span>
            <p className="mt-2">
              Wie welke renner heeft gekozen, is pas zichtbaar na de
              registratiedeadline.
            </p>
            {deadline && (
              <p className="mt-1 font-medium text-[#374151]">
                Deadline:{" "}
                {deadline.toLocaleString("nl-NL", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>
        ) : pickers.length === 0 ? (
          <div className="rounded-xl border border-[#E5E5E0] bg-white p-6 text-center text-sm text-[#6B7280]">
            Niemand heeft {rider.full_name} gekozen.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-sm">
            <div className="divide-y divide-[#F3F4F6]">
              {pickers.map((picker) => (
                <Link
                  key={picker.user_id}
                  href={`/deelnemers/${picker.user_id}`}
                  className="flex items-center justify-between px-4 py-3 transition hover:bg-[#FAFAF7]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F7EE] text-sm font-bold text-[#006B35]">
                      {picker.display_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-[#111827]">
                      {picker.display_name}
                    </span>
                  </div>
                  <span className="text-xs text-[#6B7280]">
                    Ploeg bekijken →
                  </span>
                </Link>
              ))}
            </div>
            <div className="border-t border-[#E5E5E0] bg-[#F9F9F7] px-4 py-2.5">
              <span className="text-xs text-[#6B7280]">
                {pickers.length}{" "}
                {pickers.length === 1 ? "deelnemer" : "deelnemers"} ·{" "}
                gewicht: ÷ √{pickers.length} ={" "}
                {(1 / Math.sqrt(pickers.length)).toFixed(3)}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Etapperesultaten */}
      {lockedResults.length > 0 && (
        <section>
          <h2 className="mb-3 border-l-4 border-[#FFD700] pl-3 text-xl font-bold text-[#1A1A1A]">
            Resultaten
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E0] bg-[#F9F9F7]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Etappe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Categorie
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Positie
                  </th>
                </tr>
              </thead>
              <tbody>
                {lockedResults.map((r, i) => {
                  const stage = r.stages as unknown as {
                    stage_number: number;
                    stage_date: string;
                  } | null;
                  return (
                    <tr key={i} className="border-b border-[#F3F4F6]">
                      <td className="px-4 py-2.5 font-medium text-[#111827]">
                        Et. {stage?.stage_number ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[#374151]">
                        {RESULT_LABELS[r.result_type] ?? r.result_type}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-[#006B35]">
                        {r.position}e
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

const RESULT_LABELS: Record<string, string> = {
  stage_finish: "🏁 Etappeuitslag",
  gc_standing: "🟡 Algemeen klassement",
  mountain_standing: "🔴 Bergklassement",
  sprint_standing: "🟢 Puntenklassement",
  white_standing: "⚪ Jongerenklassement",
};
