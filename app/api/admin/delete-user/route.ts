import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "userId ontbreekt" }, { status: 400 });

  const supabase = await createServiceClient();

  // Check of aanvrager admin is
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  // Voorkom dat admin zichzelf verwijdert
  if (userId === user.id) {
    return NextResponse.json({ error: "Je kunt jezelf niet verwijderen" }, { status: 400 });
  }

  // Verwijder gerelateerde data (cascade vangt team_picks, messages, joker_picks)
  // Profiel verwijderen triggert ON DELETE CASCADE voor team_picks en messages
  await supabase.from("joker_picks").delete().eq("user_id", userId);
  await supabase.from("profiles").delete().eq("id", userId);

  // Verwijder de auth user via Admin API
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
