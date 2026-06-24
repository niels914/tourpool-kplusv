import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { stageId } = await request.json();
  if (!stageId) return NextResponse.json({ error: "stageId vereist" }, { status: 400 });

  const { data: stage } = await supabase
    .from("stages")
    .select("stage_number, stage_type, status")
    .eq("id", stageId)
    .single();

  if (!stage) return NextResponse.json({ error: "Etappe niet gevonden" }, { status: 404 });
  if (stage.status === "locked") return NextResponse.json({ error: "Etappe al vergrendeld" }, { status: 400 });
  if (stage.stage_type === "ttt") return NextResponse.json({ error: "Gebruik TTT-invoer voor teamtijdritten" }, { status: 400 });

  const { data: riders } = await supabase
    .from("riders")
    .select("id, bib_number, full_name")
    .eq("is_dns", false)
    .eq("is_dnf", false);

  if (!riders || riders.length < 10) {
    return NextResponse.json({ error: "Te weinig renners in de database (minimaal 10 nodig)" }, { status: 400 });
  }

  const shuffled = shuffle(riders);

  const classifications: { type: string; count: number }[] = [
    { type: "stage_finish", count: 10 },
    { type: "gc_standing", count: 3 },
    { type: "mountain_standing", count: 3 },
    { type: "sprint_standing", count: 3 },
    { type: "white_standing", count: 3 },
  ];

  const results: { stage_id: string; rider_id: string; result_type: string; position: number }[] = [];
  let offset = 0;

  for (const { type, count } of classifications) {
    for (let i = 0; i < count; i++) {
      const rider = shuffled[(offset + i) % shuffled.length];
      results.push({
        stage_id: stageId,
        rider_id: rider.id,
        result_type: type,
        position: i + 1,
      });
    }
    offset += count;
  }

  await supabase.from("stage_results").delete().eq("stage_id", stageId);

  const { error } = await supabase.from("stage_results").insert(results);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("stages")
    .update({ status: "results_pending" })
    .eq("id", stageId);

  return NextResponse.json({
    success: true,
    inserted: results.length,
    preview: results.map((r) => {
      const rider = riders.find((rd) => rd.id === r.rider_id);
      return { ...r, rider_name: rider?.full_name, bib_number: rider?.bib_number };
    }),
  });
}
