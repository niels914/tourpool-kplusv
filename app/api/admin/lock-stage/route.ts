import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

  const { stage_id } = await request.json();
  if (!stage_id) return NextResponse.json({ error: "stage_id vereist" }, { status: 400 });

  const { error } = await supabase
    .from("stages")
    .update({
      status: "locked",
      locked_at: new Date().toISOString(),
      locked_by: user.id,
    })
    .eq("id", stage_id)
    .eq("status", "results_pending");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
