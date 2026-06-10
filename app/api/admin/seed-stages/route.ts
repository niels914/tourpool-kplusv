import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Tour de France 2026 — officieel parcours (bron: Wikipedia / PCS)
// Start: 4 juli Barcelona – Finish: 26 juli Parijs
// Rustdagen: 13 juli en 20 juli
const TOUR_2026_STAGES: {
  stage_number: number;
  stage_date: string;
  stage_type: "rit" | "ttt" | "itt";
  profile: string;
  departure: string;
  arrival: string;
  distance_km: number;
}[] = [
  { stage_number: 1,  stage_date: "2026-07-04", stage_type: "ttt", profile: "tijdrit", departure: "Barcelona",                    arrival: "Barcelona",                distance_km: 19.7  },
  { stage_number: 2,  stage_date: "2026-07-05", stage_type: "rit", profile: "heuvel",  departure: "Tarragona",                    arrival: "Barcelona",                distance_km: 178.0 },
  { stage_number: 3,  stage_date: "2026-07-06", stage_type: "rit", profile: "berg",    departure: "Granollers",                   arrival: "Les Angles",               distance_km: 196.0 },
  { stage_number: 4,  stage_date: "2026-07-07", stage_type: "rit", profile: "heuvel",  departure: "Carcassonne",                  arrival: "Foix",                     distance_km: 182.0 },
  { stage_number: 5,  stage_date: "2026-07-08", stage_type: "rit", profile: "vlak",    departure: "Lannemezan",                   arrival: "Pau",                      distance_km: 158.0 },
  { stage_number: 6,  stage_date: "2026-07-09", stage_type: "rit", profile: "berg",    departure: "Pau",                          arrival: "Gavarnie-Gèdre",           distance_km: 186.0 },
  { stage_number: 7,  stage_date: "2026-07-10", stage_type: "rit", profile: "vlak",    departure: "Hagetmau",                     arrival: "Bordeaux",                 distance_km: 175.0 },
  { stage_number: 8,  stage_date: "2026-07-11", stage_type: "rit", profile: "vlak",    departure: "Périgueux",                    arrival: "Bergerac",                 distance_km: 182.0 },
  { stage_number: 9,  stage_date: "2026-07-12", stage_type: "rit", profile: "heuvel",  departure: "Malemort",                     arrival: "Ussel",                    distance_km: 185.0 },
  // Rustdag: 13 juli
  { stage_number: 10, stage_date: "2026-07-14", stage_type: "rit", profile: "berg",    departure: "Aurillac",                     arrival: "Le Lioran",                distance_km: 167.0 },
  { stage_number: 11, stage_date: "2026-07-15", stage_type: "rit", profile: "vlak",    departure: "Vichy",                        arrival: "Nevers",                   distance_km: 161.0 },
  { stage_number: 12, stage_date: "2026-07-16", stage_type: "rit", profile: "vlak",    departure: "Circuit Nevers Magny-Cours",   arrival: "Chalon-sur-Saône",         distance_km: 181.0 },
  { stage_number: 13, stage_date: "2026-07-17", stage_type: "rit", profile: "heuvel",  departure: "Dole",                         arrival: "Belfort",                  distance_km: 205.0 },
  { stage_number: 14, stage_date: "2026-07-18", stage_type: "rit", profile: "berg",    departure: "Mulhouse",                     arrival: "Le Markstein",             distance_km: 155.0 },
  { stage_number: 15, stage_date: "2026-07-19", stage_type: "rit", profile: "berg",    departure: "Champagnole",                  arrival: "Plateau de Solaison",      distance_km: 184.0 },
  // Rustdag: 20 juli
  { stage_number: 16, stage_date: "2026-07-21", stage_type: "itt", profile: "tijdrit", departure: "Évian-les-Bains",              arrival: "Thonon-les-Bains",         distance_km: 26.0  },
  { stage_number: 17, stage_date: "2026-07-22", stage_type: "rit", profile: "vlak",    departure: "Chambéry",                     arrival: "Voiron",                   distance_km: 175.0 },
  { stage_number: 18, stage_date: "2026-07-23", stage_type: "rit", profile: "berg",    departure: "Voiron",                       arrival: "Orcières-Merlette",        distance_km: 185.0 },
  { stage_number: 19, stage_date: "2026-07-24", stage_type: "rit", profile: "berg",    departure: "Gap",                          arrival: "Alpe d'Huez",              distance_km: 128.0 },
  { stage_number: 20, stage_date: "2026-07-25", stage_type: "rit", profile: "berg",    departure: "Le Bourg-d'Oisans",            arrival: "Alpe d'Huez",              distance_km: 171.0 },
  { stage_number: 21, stage_date: "2026-07-26", stage_type: "rit", profile: "vlak",    departure: "Thoiry",                       arrival: "Paris Champs-Élysées",     distance_km: 130.0 },
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
