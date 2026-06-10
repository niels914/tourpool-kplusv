import { createClient } from "@/lib/supabase/server";
import { TeamGroup } from "./TeamGroup";
import { TopRidersBlock } from "./TopRidersBlock";

function toTeamSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s*[-–—]\s*/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const revalidate = 120;

export default async function RennersPage() {
  const supabase = await createClient();

  // Alle renners gesorteerd op rugnummer (= officiële TdF-ploegvolgorde)
  const { data: riders } = await supabase
    .from("riders")
    .select("id, bib_number, bib_digit, full_name, team_name, nationality, pcs_slug, is_dns, is_dnf")
    .order("bib_number", { ascending: true });

  const { data: pickCounts } = await supabase
    .from("rider_pick_counts")
    .select("rider_id, pick_count");

  const countByRider: Record<string, number> = {};
  pickCounts?.forEach((p) => {
    countByRider[p.rider_id] = p.pick_count;
  });

  // Ruwe punten per renner (som over alle vergrendelde etappes)
  const { data: rawPoints } = await supabase
    .from("stage_raw_points")
    .select("rider_id, raw_points");

  const rawByRider: Record<string, number> = {};
  rawPoints?.forEach((r) => {
    rawByRider[r.rider_id] = (rawByRider[r.rider_id] ?? 0) + (r.raw_points ?? 0);
  });

  const hasPoints = Object.keys(rawByRider).length > 0;

  // Deadline check — pick-aantallen zichtbaar na deadline
  const { data: config } = await supabase
    .from("config")
    .select("value")
    .eq("key", "registration_deadline")
    .single();

  const deadline = config ? new Date(config.value) : null;
  const showPicks = deadline ? new Date() >= deadline : false;

  // Groepeer op ploeg, behoud TdF-volgorde (laagste rugnummer per ploeg = positie)
  const teamMinBib: Record<string, number> = {};
  const teamGroups: Record<string, NonNullable<typeof riders>> = {};
  riders?.forEach((r) => {
    if (!teamGroups[r.team_name]) {
      teamGroups[r.team_name] = [];
      teamMinBib[r.team_name] = r.bib_number;
    }
    teamGroups[r.team_name].push(r);
    if (r.bib_number < teamMinBib[r.team_name]) {
      teamMinBib[r.team_name] = r.bib_number;
    }
  });

  // Sorteer ploegen op laagste rugnummer (= officiële TdF startvolgorde)
  const sortedTeams = Object.entries(teamGroups).sort(
    ([a], [b]) => teamMinBib[a] - teamMinBib[b]
  );

  // Alle renners met punten gesorteerd (voor uitklapbare top)
  type TopRider = {
    rider_id: string;
    full_name: string;
    bib_number: number;
    team_name: string;
    total_raw: number;
    pick_count: number;
  };
  let allScoringRiders: TopRider[] = [];
  if (hasPoints) {
    const sortedIds = Object.entries(rawByRider)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const { data: riderData } = await supabase
      .from("riders")
      .select("id, full_name, bib_number, team_name");

    allScoringRiders = sortedIds
      .map((id) => {
        const r = riderData?.find((x) => x.id === id);
        if (!r) return null;
        return {
          rider_id: id,
          full_name: r.full_name,
          bib_number: r.bib_number,
          team_name: r.team_name,
          total_raw: rawByRider[id],
          pick_count: countByRider[id] ?? 0,
        };
      })
      .filter(Boolean) as TopRider[];
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111827]">Renners</h1>
        <p className="mt-1 text-[#6B7280]">
          {riders?.length ?? 0} renners in de Tour de France 2026
          {showPicks && " — klik op een renner om te zien wie hem gekozen heeft"}
        </p>
      </div>

      {allScoringRiders.length > 0 && (
        <TopRidersBlock riders={allScoringRiders} />
      )}

      {!riders?.length ? (
        <div className="rounded-2xl border border-dashed border-[#E2DFF0] bg-white p-12 text-center">
          <div className="mb-3 text-4xl">🚴</div>
          <p className="text-[#6B7280]">De startlijst is nog niet geladen.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedTeams.map(([teamName, teamRiders]) => (
            <TeamGroup
              key={teamName}
              teamName={teamName}
              riders={teamRiders}
              countByRider={countByRider}
              rawByRider={rawByRider}
              showPicks={showPicks}
              hasPoints={hasPoints}
              teamSlug={toTeamSlug(teamName)}
              defaultOpen={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
