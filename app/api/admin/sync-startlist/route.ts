import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { fetchStartlist } from "@/lib/pcs";

export async function POST(request: NextRequest) {
  void request;
  const supabase = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  try {
    const pcsRiders = await fetchStartlist();

    if (!pcsRiders.length) {
      return NextResponse.json({ error: "Geen renners gevonden op PCS" }, { status: 404 });
    }

    let added = 0;
    let updated = 0;

    for (const rider of pcsRiders) {
      const { data: existing } = await supabase
        .from("riders")
        .select("id")
        .eq("bib_number", rider.bib_number)
        .single();

      if (existing) {
        await supabase
          .from("riders")
          .update({
            full_name: rider.full_name,
            team_name: rider.team_name,
            nationality: rider.nationality || null,
            pcs_slug: rider.pcs_slug || null,
          })
          .eq("id", existing.id);
        updated++;
      } else {
        await supabase.from("riders").insert({
          bib_number: rider.bib_number,
          full_name: rider.full_name,
          team_name: rider.team_name,
          nationality: rider.nationality || null,
          pcs_slug: rider.pcs_slug || null,
        });
        added++;
      }
    }

    return NextResponse.json({ success: true, added, updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
