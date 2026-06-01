import { createClient } from "@supabase/supabase-js";
import { parse } from "node-html-parser";

// Netlify scheduled function — draait elke 30 min tijdens de Tour
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PCS_BASE = "https://www.procyclingstats.com";
const TOUR_PATH = "race/tour-de-france/2026";

export default async function handler() {
  console.log("[sync-stage-results] Start sync:", new Date().toISOString());

  // Haal etappes op die vandaag of eerder zijn en nog niet vergrendeld
  const today = new Date().toISOString().split("T")[0];
  const { data: stages, error: stagesError } = await supabase
    .from("stages")
    .select("id, stage_number, stage_type, status")
    .lte("stage_date", today)
    .neq("status", "locked")
    .neq("stage_type", "ttt")
    .order("stage_number", { ascending: true });

  if (stagesError) {
    console.error("[sync-stage-results] Fout bij ophalen etappes:", stagesError.message);
    return;
  }

  if (!stages?.length) {
    console.log("[sync-stage-results] Geen etappes om te synchroniseren.");
    return;
  }

  // Haal renners op voor rugnummer-koppeling
  const { data: riders } = await supabase.from("riders").select("id, bib_number");
  const riderByBib: Record<number, string> = {};
  riders?.forEach((r) => { riderByBib[r.bib_number] = r.id; });

  for (const stage of stages) {
    try {
      console.log(`[sync-stage-results] Etappe ${stage.stage_number} ophalen...`);
      const results = await fetchStageResults(stage.stage_number);

      if (!results.length) {
        console.log(`[sync-stage-results] Etappe ${stage.stage_number}: geen resultaten.`);
        continue;
      }

      // Verwijder bestaande resultaten
      await supabase.from("stage_results").delete().eq("stage_id", stage.id);

      let inserted = 0;
      for (const result of results) {
        const riderId = riderByBib[result.bib_number];
        if (!riderId) continue;
        const { error } = await supabase.from("stage_results").insert({
          stage_id: stage.id,
          rider_id: riderId,
          result_type: result.result_type,
          position: result.position,
        });
        if (!error) inserted++;
      }

      // Zet status op results_pending (admin moet vergrendelen)
      await supabase
        .from("stages")
        .update({ status: "results_pending" })
        .eq("id", stage.id);

      console.log(`[sync-stage-results] Etappe ${stage.stage_number}: ${inserted} resultaten opgeslagen.`);
    } catch (err) {
      console.error(`[sync-stage-results] Fout bij etappe ${stage.stage_number}:`, err);
    }
  }

  console.log("[sync-stage-results] Sync klaar.");
}

async function fetchStageResults(stageNumber: number) {
  const url = `${PCS_BASE}/${TOUR_PATH}/stage-${stageNumber}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TourpoolBot/1.0)" },
  });
  if (!res.ok) return [];

  const html = await res.text();
  const root = parse(html);
  const results: Array<{
    rider_name: string;
    bib_number: number;
    position: number;
    result_type: "stage_finish" | "gc_standing" | "mountain_standing" | "sprint_standing" | "white_standing";
  }> = [];

  const tables = [
    { selector: "div#resultado-eti table.basic", type: "stage_finish" as const, maxPos: 10 },
    { selector: "div#gc table.basic",            type: "gc_standing" as const,  maxPos: 3 },
    { selector: "div#kom table.basic",           type: "mountain_standing" as const, maxPos: 3 },
    { selector: "div#sprint table.basic",        type: "sprint_standing" as const,   maxPos: 3 },
    { selector: "div#youth table.basic",         type: "white_standing" as const,    maxPos: 3 },
  ];

  for (const { selector, type, maxPos } of tables) {
    const table = root.querySelector(selector);
    if (!table) continue;
    for (const row of table.querySelectorAll("tbody tr")) {
      const cells = row.querySelectorAll("td");
      if (cells.length < 3) continue;
      const pos = parseInt(cells[0].text.trim().replace(".", ""), 10);
      if (isNaN(pos) || pos > maxPos) continue;
      const bib = parseInt(cells[1]?.text.trim() ?? "", 10);
      const nameEl = row.querySelector("a[href*='/rider/']");
      const name = (nameEl?.text ?? cells[2]?.text ?? "").trim();
      results.push({ rider_name: name, bib_number: isNaN(bib) ? 0 : bib, position: pos, result_type: type });
    }
  }

  return results;
}
