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
  // PCS zit achter Cloudflare, dat een directe fetch vanaf een server (Node/undici,
  // dus ook Netlify) blokkeert met een 403 bot-challenge. Zet daarom een scraping-proxy
  // in via de env-var PCS_PROXY_TEMPLATE — een URL-template met {url} als placeholder,
  // bijvoorbeeld:
  //   ScraperAPI:  http://api.scraperapi.com/?api_key=XXX&ultra_premium=true&url={url}
  //   ScrapingBee: https://app.scrapingbee.com/api/v1/?api_key=XXX&stealth_proxy=true&url={url}
  //   ZenRows:     https://api.zenrows.com/v1/?apikey=XXX&premium_proxy=true&url={url}
  // Zonder de env-var valt hij terug op een directe fetch (werkt alleen lokaal/curl-achtig).
  const proxyTemplate = process.env.PCS_PROXY_TEMPLATE;
  const requestUrl = proxyTemplate
    ? proxyTemplate.replace("{url}", encodeURIComponent(url))
    : url;

  const res = await fetch(requestUrl, {
    // Bij proxy regelt de dienst zelf de browser-fingerprint; bij directe fetch
    // sturen we browserachtige headers mee (helpt niet tegen Cloudflare, wel netter).
    headers: proxyTemplate
      ? {}
      : {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
          Referer: `${PCS_BASE}/`,
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

export async function fetchStageResults(stageNumber: number, year?: number): Promise<PcsStageResult[]> {
  const path = year ? `race/tour-de-france/${year}` : TOUR_PATH;
  const url = `${PCS_BASE}/${path}/stage-${stageNumber}`;
  const html = await fetchPage(url);
  const root = parse(html);

  const results: PcsStageResult[] = [];

  // PCS-resultaten staan in #resultsCont met per klassement een .resTab[data-id].
  // De navigatie-links (a[data-id]) koppelen een label (STAGE/GC/...) aan het data-id.
  const cont = root.querySelector("div#resultsCont");
  if (!cont) return results;

  const idByLabel: Record<string, string> = {};
  for (const a of root.querySelectorAll("a[data-id]")) {
    const id = a.getAttribute("data-id");
    if (id) idByLabel[a.text.trim().toUpperCase()] = id;
  }

  const classifications: { label: string; type: PcsStageResult["result_type"]; maxPos: number }[] = [
    { label: "STAGE", type: "stage_finish", maxPos: 10 },
    { label: "GC", type: "gc_standing", maxPos: 3 },
    { label: "POINTS", type: "sprint_standing", maxPos: 3 },
    { label: "KOM", type: "mountain_standing", maxPos: 3 },
    { label: "YOUTH", type: "white_standing", maxPos: 3 },
  ];

  for (const { label, type, maxPos } of classifications) {
    const id = idByLabel[label];
    if (!id) continue;

    const tab = cont.querySelector(`.resTab[data-id="${id}"]`);
    if (!tab) continue;

    // Alleen de eerste resultatentabel; latere tabellen zijn subtotalen
    // (tussensprints, bergpunten per col) die de posities opnieuw nummeren.
    const table = tab.querySelector("table");
    if (!table) continue;

    const body = table.querySelector("tbody") ?? table;
    for (const row of body.querySelectorAll("tr")) {
      const firstCell = row.querySelector("td");
      if (!firstCell) continue;

      const pos = parseInt(firstCell.text.trim().replace(".", ""), 10);
      if (isNaN(pos) || pos < 1 || pos > maxPos) continue;

      const bib = parseInt(row.querySelector("td.bibs")?.text.trim() ?? "", 10);
      const nameEl = row.querySelector("a[href*='rider/']");
      const name = normalizeName(nameEl?.text.trim() ?? "");

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
