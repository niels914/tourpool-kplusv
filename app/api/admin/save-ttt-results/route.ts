import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "Geen admin" }, { status: 403 });

  const body = await request.json();
  const { stage_id, results } = body as {
    stage_id: string;
    results: { position: number; team_name: string }[];
  };

  if (!stage_id || !results?.length) {
    return NextResponse.json({ error: "Ongeldige data" }, { status: 400 });
  }

  // Verwijder bestaande TTT-resultaten voor deze etappe
  await supabase.from("ttt_team_results").delete().eq("stage_id", stage_id);

  // Insert nieuwe resultaten
  const { error } = await supabase.from("ttt_team_results").insert(
    results.map((r) => ({
      stage_id,
      team_name: r.team_name,
      position: r.position,
    }))
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Zet status naar results_pending zodat de admin kan vergrendelen
  await supabase
    .from("stages")
    .update({ status: "results_pending" })
    .eq("id", stage_id)
    .eq("status", "scheduled");

  return NextResponse.json({ ok: true });
}
