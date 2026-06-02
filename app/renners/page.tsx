import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 120;

export default async function RennersPage() {
  const supabase = await createClient();

  // Alle renners + hun pick-count
  const { data: riders } = await supabase
    .from("riders")
    .select("id, bib_number, bib_digit, full_name, team_name, nationality, is_dns, is_dnf")
    .order("bib_number", { ascending: true });

  const { data: pickCounts } = await supabase
    .from("rider_pick_counts")
    .select("rider_id, pick_count");

  const countByRider: Record<string, number> = {};
  pickCounts?.forEach((p) => {
    countByRider[p.rider_id] = p.pick_count;
  });

  // Deadline check — pick-aantallen zichtbaar na deadline
  const { data: config } = await supabase
    .from("config")
    .select("value")
    .eq("key", "registration_deadline")
    .single();

  const deadline = config ? new Date(config.value) : null;
  const showPicks = deadline ? new Date() >= deadline : false;

  // Groepeer op ploeg voor overzicht
  const teamGroups: Record<string, typeof riders> = {};
  riders?.forEach((r) => {
    if (!teamGroups[r.team_name]) teamGroups[r.team_name] = [];
    teamGroups[r.team_name]!.push(r);
  });

  const sortedTeams = Object.entries(teamGroups).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Renners</h1>
        <p className="mt-1 text-[#6B7280]">
          {riders?.length ?? 0} renners in de Tour de France 2026
          {showPicks && " — klik op een renner om te zien wie hem gekozen heeft"}
        </p>
      </div>

      {!riders?.length ? (
        <div className="rounded-2xl border border-dashed border-[#E5E5E0] bg-white p-12 text-center">
          <div className="mb-3 text-4xl">🚴</div>
          <p className="text-[#6B7280]">De startlijst is nog niet geladen.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedTeams.map(([teamName, teamRiders]) => (
            <div
              key={teamName}
              className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-sm"
            >
              <div className="border-b border-[#E5E5E0] bg-[#F9F9F7] px-4 py-3">
                <h2 className="font-semibold text-[#111827]">{teamName}</h2>
              </div>
              <div className="divide-y divide-[#F3F4F6]">
                {teamRiders?.map((rider) => {
                  const picks = countByRider[rider.id] ?? 0;
                  const isOut = rider.is_dns || rider.is_dnf;

                  return (
                    <Link
                      key={rider.id}
                      href={`/renners/${rider.id}`}
                      className={`flex items-center justify-between px-4 py-3 transition hover:bg-[#FAFAF7] ${
                        isOut ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Rugnummer badge */}
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-bold text-[#FFD700]">
                          {rider.bib_number}
                        </span>
                        <div>
                          <span className="font-medium text-[#111827]">
                            {rider.full_name}
                          </span>
                          {rider.nationality && (
                            <span className="ml-2 text-xs text-[#6B7280]">
                              {rider.nationality}
                            </span>
                          )}
                          {rider.is_dns && (
                            <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                              DNS
                            </span>
                          )}
                          {rider.is_dnf && (
                            <span className="ml-2 rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
                              DNF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pick-teller */}
                      <div className="flex items-center gap-2">
                        {showPicks ? (
                          <PickBar count={picks} />
                        ) : (
                          <span className="text-xs text-[#6B7280]">
                            slot …{rider.bib_digit}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PickBar({ count }: { count: number }) {
  const MAX = 5; // verwacht max deelnemers die 1 renner kiezen
  const width = Math.min((count / MAX) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <div className="hidden w-20 overflow-hidden rounded-full bg-[#E5E5E0] sm:block" style={{ height: 6 }}>
        <div
          className="h-full rounded-full bg-[#00A651] transition-all"
          style={{ width: count > 0 ? `${width}%` : "0%" }}
        />
      </div>
      <span
        className={`min-w-[2rem] rounded-full px-2.5 py-0.5 text-center text-xs font-semibold ${
          count > 0
            ? "bg-[#E8F7EE] text-[#006B35]"
            : "bg-[#F3F4F6] text-[#9CA3AF]"
        }`}
      >
        {count}×
      </span>
    </div>
  );
}
