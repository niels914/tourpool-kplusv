import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type FinalResult = {
  result_type: "final_gc" | "final_mountain" | "final_sprint" | "final_white";
  position: number;
  rider_id: string;
};

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin)
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  const { results }: { results: FinalResult[] } = await request.json();

  if (!results?.length)
    return NextResponse.json({ error: "Geen resultaten meegegeven" }, { status: 400 });

  // Valideer: geen dubbele renners per classificatie
  const byType = new Map<string, Set<string>>();
  for (const r of results) {
    if (!byType.has(r.result_type)) byType.set(r.result_type, new Set());
    const set = byType.get(r.result_type)!;
    if (set.has(r.rider_id)) {
      return NextResponse.json(
        { error: `Dubbele renner in ${r.result_type}` },
        { status: 400 }
      );
    }
    set.add(r.rider_id);
  }

  // Haal alle types op die in deze batch zitten
  const types = [...new Set(results.map((r) => r.result_type))];

  // Verwijder bestaande resultaten voor deze typen en sla nieuwe op
  for (const type of types) {
    await supabase.from("final_results").delete().eq("result_type", type);
  }

  const { error } = await supabase.from("final_results").insert(results);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, saved: results.length });
}
