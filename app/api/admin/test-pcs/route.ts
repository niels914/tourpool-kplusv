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

  const { year, stageNumber } = await request.json();
  if (!year || !stageNumber) {
    return NextResponse.json({ error: "year en stageNumber vereist" }, { status: 400 });
  }

  try {
    const results = await fetchStageResults(stageNumber, year);
    return NextResponse.json({ results, count: results.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
