import { parse } from "node-html-parser";

const PCS_BASE = "https://www.procyclingstats.com";
const TOUR_PATH = "race/tour-de-france/2026";

export type PcsRider = {
  bib_number: number;
  full_name: string;
  team_name: string;
  nationality: string;
  pcs_slug: string;
};

export type PcsStageResult = {
  rider_name: string;
  bib_number: number;
  position: number;
  result_type: "stage_finish" | "gc_standing" | "mountain_standing" | "sprint_standing" | "white_standing";
};

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TourpoolBot/1.0)",
      Accept: "text/html",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`PCS fetch fout: ${res.status} voor ${url}`);
  return res.text();
}

export async function fetchStartlist(): Promise<PcsRider[]> {
  const html = await fetchPage(`${PCS_BASE}/${TOUR_PATH}/startlist`);
  const root = parse(html);

  const riders: PcsRider[] = [];

  // PCS startlist: ploegen staan als blokken, renners met rugnummers
  const teamBlocks = root.querySelectorAll("ul.startlist_v4 li.team");

  for (const team of teamBlocks) {
    const teamName = team.querySelector("b")?.text.trim() ?? "";
    const riderItems = team.querySelectorAll("li");

    for (const item of riderItems) {
      const link = item.querySelector("a");
      const bibEl = item.querySelector("span.bib");
      if (!link || !bibEl) continue;

      const bib = parseInt(bibEl.text.trim(), 10);
      if (isNaN(bib) || bib <= 0) continue;

      const href = link.getAttribute("href") ?? "";
      const slug = href.split("/").pop() ?? "";
      const name = normalizeName(link.text.trim());
      const nat = item.querySelector("span.nat")?.text.trim() ?? "";

      riders.push({
        bib_number: bib,
        full_name: name,
        team_name: teamName,
        nationality: nat,
        pcs_slug: slug,
      });
    }
  }

  return riders;
}

export async function fetchStageResults(stageNumber: number): Promise<PcsStageResult[]> {
  const url = `${PCS_BASE}/${TOUR_PATH}/stage-${stageNumber}`;
  const html = await fetchPage(url);
  const root = parse(html);

  const results: PcsStageResult[] = [];

  // Elke classificatietabel heeft een specifieke klasse
  const tables = [
    { selector: "div#resultado-eti table.basic", type: "stage_finish" as const, maxPos: 10 },
    { selector: "div#gc table.basic", type: "gc_standing" as const, maxPos: 3 },
    { selector: "div#kom table.basic", type: "mountain_standing" as const, maxPos: 3 },
    { selector: "div#sprint table.basic", type: "sprint_standing" as const, maxPos: 3 },
    { selector: "div#youth table.basic", type: "white_standing" as const, maxPos: 3 },
  ];

  for (const { selector, type, maxPos } of tables) {
    const table = root.querySelector(selector);
    if (!table) continue;

    const rows = table.querySelectorAll("tbody tr");
    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length < 3) continue;

      const posText = cells[0].text.trim().replace(".", "");
      const pos = parseInt(posText, 10);
      if (isNaN(pos) || pos > maxPos) continue;

      const bib = parseInt(cells[1]?.text.trim() ?? "", 10);
      const nameEl = row.querySelector("a[href*='/rider/']");
      const name = normalizeName(nameEl?.text.trim() ?? cells[2]?.text.trim() ?? "");

      results.push({
        rider_name: name,
        bib_number: isNaN(bib) ? 0 : bib,
        position: pos,
        result_type: type,
      });
    }
  }

  return results;
}

function capitalizeWord(w: string): string {
  const lower = w.normalize("NFC").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function normalizeName(name: string): string {
  return name
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) =>
      // Handle hyphens (Paret-Peintre) and apostrophes (O'Connor)
      word
        .split(/([-'])/)
        .map((part, i) => (part === "-" || part === "'" ? part : capitalizeWord(part)))
        .join("")
    )
    .join(" ");
}
