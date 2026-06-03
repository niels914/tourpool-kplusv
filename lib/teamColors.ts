/**
 * Primaire ploegkleur(en) per PCS-slug.
 * Gebruikt voor het kleuraccent in de ploegbalk op de renners-pagina.
 * Twee kleuren = gradient van links naar rechts.
 */
export const TEAM_COLORS: Record<string, [string, string]> = {
  // UAE Team Emirates – XRG: rood + wit
  "uae-team-emirates-xrg":        ["#E31E24", "#FFFFFF"],
  // Visma | Lease a Bike: geel + zwart
  "visma-lease-a-bike":           ["#FFD700", "#1A1A1A"],
  // INEOS Grenadiers: zwart + rood
  "ineos-grenadiers":             ["#1A1A1A", "#E31E24"],
  // Lidl-Trek: blauw + rood
  "lidl-trek":                    ["#003DA5", "#E31E24"],
  // Soudal Quick-Step: blauw + wit
  "soudal-quick-step":            ["#0057A8", "#FFFFFF"],
  // Groupama-FDJ: blauw + wit
  "groupama-fdj":                 ["#003087", "#FFFFFF"],
  // Decathlon AG2R La Mondiale: groen + wit
  "decathlon-ag2r-la-mondiale":   ["#007A3D", "#FFFFFF"],
  // Bahrain Victorious: rood + goud
  "bahrain-victorious":           ["#CC0000", "#C8A84B"],
  // Cofidis: rood + wit
  "cofidis":                      ["#C00000", "#FFFFFF"],
  // Movistar Team: blauw + cyaan
  "movistar-team":                ["#009DE0", "#00B388"],
  // EF Education-EasyPost: roze + zwart
  "ef-education-easypost":        ["#E91E8C", "#1A1A1A"],
  // Intermarché-Wanty: oranje + zwart
  "intermarch-wanty":             ["#F47920", "#1A1A1A"],
  // DSM-Firmenich PostNL: oranje + rood
  "dsm-firmenich-postnl":         ["#FF6600", "#CC0000"],
  // Israel Premier Tech: oranje + zwart
  "israel-premier-tech":          ["#FF5A00", "#1A1A1A"],
  // Alpecin-Deceuninck: zwart + oranje
  "alpecin-deceuninck":           ["#1A1A1A", "#FF6600"],
  // Lotto Dstny: rood + wit
  "lotto-dstny":                  ["#C00000", "#FFFFFF"],
  // TotalEnergies: geel + oranje
  "totalenergies":                ["#FFD700", "#FF6600"],
  // Arkéa-B&B Hotels: oranje + zwart
  "arkea-bb-hotels":              ["#FF6600", "#1A1A1A"],
  // Tudor Pro Cycling: rood + goud
  "tudor-pro-cycling":            ["#8B0000", "#C8A84B"],
  // XDS Astana: blauw + geel
  "xds-astana":                   ["#003087", "#FFD700"],
  // Jayco AlUla: blauw + groen
  "jayco-alula":                  ["#004B87", "#00843D"],
};

/** Geef kleurpaar terug op basis van slug (met fallback). */
export function getTeamColors(slug: string): [string, string] {
  return TEAM_COLORS[slug] ?? ["#5760A6", "#B8AED6"];
}
