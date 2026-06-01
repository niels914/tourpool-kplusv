import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { fetchStageResults } from "@/lib/pcs";

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

  const { searchParams } = new URL(request.url);
  const stageId = searchParams.get("stage_id");
  if (!stageId) return NextResponse.json({ error: "stage_id vereist" }, { status: 400 });

  const { data: stage } = await supabase
    .from("stages")
    .select("stage_number, stage_type, status")
    .eq("id", stageId)
    .single();

  if (!stage) return NextResponse.json({ error: "Etappe niet gevonden" }, { status: 404 });
  if (stage.status === "locked") return NextResponse.json({ error: "Etappe al vergrendeld" }, { status: 400 });
  if (stage.stage_type === "ttt") return NextResponse.json({ error: "TTT heeft geen scoring" }, { status: 400 });

  try {
    const pcsResults = await fetchStageResults(stage.stage_number);

    if (!pcsResults.length) {
      return NextResponse.json({ error: "Geen resultaten gevonden op PCS" }, { status: 404 });
    }

    // Haal alle renners op voor koppeling via rugnummer
    const { data: riders } = await supabase
      .from("riders")
      .select("id, bib_number, full_name");

    const riderByBib: Record<number, string> = {};
    riders?.forEach((r) => { riderByBib[r.bib_number] = r.id; });

    // Verwijder bestaande resultaten voor deze etappe
    await supabase.from("stage_results").delete().eq("stage_id", stageId);

    // Verwerk en sla op
    let inserted = 0;
    for (const result of pcsResults) {
      const riderId = riderByBib[result.bib_number];
      if (!riderId) continue;

      const { error } = await supabase.from("stage_results").insert({
        stage_id: stageId,
        rider_id: riderId,
        result_type: result.result_type,
        position: result.position,
      });

      if (!error) inserted++;
    }

    // Zet status op results_pending
    await supabase
      .from("stages")
      .update({ status: "results_pending" })
      .eq("id", stageId);

    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
