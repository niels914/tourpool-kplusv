import { createClient } from "@supabase/supabase-js";
import { parse } from "node-html-parser";

// Netlify scheduled function — dagelijks 08:00 UTC in de aanloop naar de Tour
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PCS_BASE = "https://www.procyclingstats.com";
const STARTLIST_URL = `${PCS_BASE}/race/tour-de-france/2026/startlist`;

export default async function handler() {
  console.log("[sync-startlist] Start:", new Date().toISOString());

  try {
    const res = await fetch(STARTLIST_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TourpoolBot/1.0)" },
    });
    if (!res.ok) {
      console.log("[sync-startlist] PCS niet bereikbaar:", res.status);
      return;
    }

    const html = await res.text();
    const root = parse(html);

    let added = 0;
    let updated = 0;

    const teamBlocks = root.querySelectorAll("ul.startlist_v4 li.team");
    for (const team of teamBlocks) {
      const teamName = team.querySelector("b")?.text.trim() ?? "";
      for (const item of team.querySelectorAll("li")) {
        const link = item.querySelector("a");
        const bibEl = item.querySelector("span.bib");
        if (!link || !bibEl) continue;
        const bib = parseInt(bibEl.text.trim(), 10);
        if (isNaN(bib) || bib <= 0) continue;
        const href = link.getAttribute("href") ?? "";
        const slug = href.split("/").pop() ?? "";
        const name = link.text.trim();
        const nat = item.querySelector("span.nat")?.text.trim() ?? "";

        const { data: existing } = await supabase
          .from("riders")
          .select("id")
          .eq("bib_number", bib)
          .single();

        if (existing) {
          await supabase.from("riders").update({ full_name: name, team_name: teamName, nationality: nat || null, pcs_slug: slug || null }).eq("id", existing.id);
          updated++;
        } else {
          await supabase.from("riders").insert({ bib_number: bib, full_name: name, team_name: teamName, nationality: nat || null, pcs_slug: slug || null });
          added++;
        }
      }
    }

    console.log(`[sync-startlist] Klaar: ${added} toegevoegd, ${updated} bijgewerkt.`);
  } catch (err) {
    console.error("[sync-startlist] Fout:", err);
  }
}
