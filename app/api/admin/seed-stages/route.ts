import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Tour de France 2026 etappeschema (voorlopig — officieel schema volgt ~mei 2026)
const TOUR_2026_STAGES = [
  { stage_number: 1,  stage_date: "2026-06-27", stage_type: "rit" as const, departure: "Nantes", arrival: "Nantes", distance_km: 185.0 },
  { stage_number: 2,  stage_date: "2026-06-28", stage_type: "rit" as const, departure: "Nantes", arrival: "Laval", distance_km: 200.0 },
  { stage_number: 3,  stage_date: "2026-06-29", stage_type: "ttt" as const, departure: "Redon", arrival: "Redon", distance_km: 32.0 },
  { stage_number: 4,  stage_date: "2026-06-30", stage_type: "rit" as const, departure: "Vitré", arrival: "Mûr-de-Bretagne", distance_km: 180.0 },
  { stage_number: 5,  stage_date: "2026-07-01", stage_type: "rit" as const, departure: "Loudéac", arrival: "Quimper", distance_km: 195.0 },
  { stage_number: 6,  stage_date: "2026-07-02", stage_type: "rit" as const, departure: "Châteaulin", arrival: "Saint-Brieuc", distance_km: 163.0 },
  { stage_number: 7,  stage_date: "2026-07-03", stage_type: "rit" as const, departure: "Dinan", arrival: "Paris-Roubaix (Carrefour de l'Arbre)", distance_km: 170.0 },
  { stage_number: 8,  stage_date: "2026-07-05", stage_type: "rit" as const, departure: "Cambrai", arrival: "Lille Métropole", distance_km: 175.0 },
  { stage_number: 9,  stage_date: "2026-07-06", stage_type: "rit" as const, departure: "Épernay", arrival: "Troyes", distance_km: 195.0 },
  { stage_number: 10, stage_date: "2026-07-07", stage_type: "rit" as const, departure: "Auxerre", arrival: "Dijon", distance_km: 169.0 },
  { stage_number: 11, stage_date: "2026-07-08", stage_type: "itt" as const, departure: "Gevrey-Chambertin", arrival: "Gevrey-Chambertin", distance_km: 25.0 },
  { stage_number: 12, stage_date: "2026-07-09", stage_type: "rit" as const, departure: "Bourg-en-Bresse", arrival: "La Toussuire", distance_km: 174.0 },
  { stage_number: 13, stage_date: "2026-07-11", stage_type: "rit" as const, departure: "Albertville", arrival: "Courchevel", distance_km: 152.0 },
  { stage_number: 14, stage_date: "2026-07-12", stage_type: "rit" as const, departure: "Courchevel", arrival: "Megève", distance_km: 145.0 },
  { stage_number: 15, stage_date: "2026-07-13", stage_type: "rit" as const, departure: "Sallanches", arrival: "Annecy", distance_km: 190.0 },
  { stage_number: 16, stage_date: "2026-07-14", stage_type: "rit" as const, departure: "Sisteron", arrival: "Vaison-la-Romaine", distance_km: 175.0 },
  { stage_number: 17, stage_date: "2026-07-16", stage_type: "rit" as const, departure: "Bollène", arrival: "Mont Ventoux", distance_km: 167.0 },
  { stage_number: 18, stage_date: "2026-07-17", stage_type: "rit" as const, departure: "Cavaillon", arrival: "Saint-Lary-Soulan Pla d'Adet", distance_km: 215.0 },
  { stage_number: 19, stage_date: "2026-07-18", stage_type: "rit" as const, departure: "Lannemezan", arrival: "Superbagnères", distance_km: 140.0 },
  { stage_number: 20, stage_date: "2026-07-19", stage_type: "itt" as const, departure: "Lacaune", arrival: "Lacaune", distance_km: 33.0 },
  { stage_number: 21, stage_date: "2026-07-20", stage_type: "rit" as const, departure: "Paris La Défense Arena", arrival: "Paris Champs-Élysées", distance_km: 128.0 },
];

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

  let upserted = 0;
  for (const stage of TOUR_2026_STAGES) {
    const pcsUrl = `race/tour-de-france/2026/stage-${stage.stage_number}`;
    const { error } = await supabase.from("stages").upsert(
      { ...stage, pcs_stage_url: pcsUrl },
      { onConflict: "stage_number" }
    );
    if (!error) upserted++;
  }

  return NextResponse.json({ success: true, upserted });
}
