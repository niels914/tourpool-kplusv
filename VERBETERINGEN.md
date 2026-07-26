# Verbeteringen voor volgend jaar

Verzamelde aandachtspunten uit de Tour 2026-editie, om mee te nemen bij de
volgende editie van de pool.

## Joker-etappe

- **Documentatie klopt niet met de werkelijke functionaliteit.** Het
  commentaar in `supabase/migrations/20260610000006_joker_picks.sql`
  ("elke deelnemer kiest 2 etappes") en de tekst op de spelregels-pagina
  (`app/spelregels/page.tsx`) beschrijven 2 jokerkeuzes per deelnemer. In de
  praktijk staat `JokerPicker.tsx` maar 1 actieve joker-etappe per deelnemer
  toe (de vorige keuze wordt verwijderd zodra een nieuwe wordt opgeslagen).
  Voor nu bewust niet aangepast; volgend jaar keuze maken:
  - óf de tekst/commentaar corrigeren naar "1 etappe", óf
  - de functionaliteit uitbreiden naar daadwerkelijk 2 keuzes, als dat de
    oorspronkelijke bedoeling was.

- **Jokerbonus wordt nergens automatisch verwerkt in het klassement.** Er is
  geen scoringsfunctie (SQL of in `lib/scoring.ts`) die de joker-etappe met
  ×1,5 verrekent in de eindscore — alleen de keuze wordt opgeslagen
  (`joker_picks`). Dit moet nog gebouwd worden voordat de jokerbonus
  daadwerkelijk meetelt.

- **Concentratierisico rond bergetappes.** Dit jaar koos ruim 70% van de
  deelnemers (12 van de 17) een van de twee Alpe d'Huez-ritten (etappe 19 of
  20) als joker, omdat zware bergetappes de hoogste puntenpotentie hebben.
  Overweeg volgend jaar een regel die dit beperkt of juist interessanter
  maakt, bijvoorbeeld:
  - een joker die alleen voor bepaalde etappetypes geldt of juist uitgesloten
    wordt voor de zwaarste bergritten (vergelijkbaar met de bestaande
    uitsluiting van TTT-etappes als jokerkeuze),
  - of een bonus/malus die het aantrekkelijker maakt om een minder voor de
    hand liggende etappe te kiezen.

## Jokeropbrengst Tour 2026 (referentiecijfers)

Berekend op de gewogen etappepunten (`user_stage_points`, wortelregel al
toegepast) voor de etappe die elke deelnemer als joker koos. De jokerbonus is
het extra deel (×0,5); "met joker" is ×1,5. Deze bonus is **niet** verwerkt in
het klassement — zie het punt hierboven.

| Deelnemer | Etappe | Zonder joker | Jokerbonus | Met joker |
| --- | --- | --- | --- | --- |
| Eline | 19 | 15,00 | +7,50 | 22,50 |
| Niels Arends | 7 | 13,64 | +6,82 | 20,47 |
| Bo | 3 | 12,22 | +6,11 | 18,33 |
| Sylvia Hendriks | 19 | 11,37 | +5,68 | 17,05 |
| Maarten | 19 | 9,55 | +4,78 | 14,33 |
| Marco | 20 | 9,26 | +4,63 | 13,89 |
| Hendrik | 20 | 9,26 | +4,63 | 13,89 |
| Parijs is nog ver | 20 | 8,50 | +4,25 | 12,75 |
| Maaike S | 19 | 8,39 | +4,19 | 12,59 |
| Chasse Perey | 16 | 8,33 | +4,17 | 12,50 |
| Frank | 19 | 7,33 | +3,67 | 11,00 |
| Boris Polm | 5 | 6,40 | +3,20 | 9,60 |
| Peter KLM | 20 | 6,13 | +3,06 | 9,19 |
| n.ahsmann | 19 | 4,22 | +2,11 | 6,33 |
| Merijn | 19 | 2,97 | +1,49 | 4,46 |
| Martin | 19 | 2,22 | +1,11 | 3,33 |
| Marije | 9 | 1,61 | +0,81 | 2,41 |

Gemiddelde opbrengst per gekozen etappe:

- etappe 19 (8 deelnemers): 7,63 — spreiding 2,22 tot 15,00
- etappe 20 (4 deelnemers): 8,29
- etappes 3/5/7/9/16 (elk 1 deelnemer): 8,44

De populaire Alpe d'Huez-etappes leverden dus gemiddeld niet meer op dan de
minder voor de hand liggende keuzes; binnen etappe 19 zat bovendien een factor
7 verschil tussen de hoogste en laagste score, puur afhankelijk van de
ploegsamenstelling. Nuttig argument bij de afweging over de jokerregel
hierboven.

## Effect van de jokerregel op de eindstand 2026

Eindstand zoals die nu in het klassement staat, naast de stand zoals die
geweest zou zijn met de jokerbonus (×0,5 op de gekozen etappe) meegeteld.

| # nu | Deelnemer | Totaal nu | Jokerbonus | Met joker | # met joker |
| --- | --- | --- | --- | --- | --- |
| 1 | Hendrik | 230,26 | +4,63 | 234,88 | 2 |
| 2 | Sylvia Hendriks | 230,26 | +5,68 | 235,94 | 1 |
| 3 | Bo | 226,86 | +6,11 | 232,97 | 3 |
| 4 | Niels Arends | 219,42 | +6,82 | 226,25 | 4 |
| 5 | Parijs is nog ver | 218,19 | +4,25 | 222,44 | 5 |
| 6 | Marco | 215,67 | +4,63 | 220,30 | 6 |
| 7 | Eline | 204,42 | +7,50 | 211,92 | 7 |
| 8 | Maarten | 183,74 | +4,78 | 188,51 | 8 |
| 9 | Chasse Perey | 163,53 | +4,17 | 167,69 | 9 |
| 10 | Maaike S | 162,67 | +4,20 | 166,87 | 10 |
| 11 | Peter KLM | 162,29 | +3,06 | 165,35 | 11 |
| 12 | Merijn | 159,26 | +1,49 | 160,74 | 12 |
| 13 | Martin | 155,22 | +1,11 | 156,33 | 13 |
| 14 | n.ahsmann | 152,85 | +2,11 | 154,96 | 14 |
| 15 | Boris Polm | 150,57 | +3,20 | 153,77 | 15 |
| 16 | Marije | 132,15 | +0,80 | 132,96 | 17 |
| 17 | Frank | 131,19 | +3,67 | 134,86 | 16 |

Twee plaatsen wisselen: 1 ↔ 2 en 16 ↔ 17. De rest van de rangorde blijft
identiek, omdat de jokerbonussen (+0,80 tot +7,50) te dicht bij elkaar liggen
om de gaten in het klassement te overbruggen.

- **De eerste plaats is nu een gelijkspel dat alfabetisch wordt beslist.**
  Hendrik en Sylvia Hendriks staan exact gelijk op 230,26. De `klassement`-view
  breekt die gelijkstand met
  `rank() over (order by total_points desc, display_name asc)` — dus op
  weergavenaam, niet op prestatie. Volgend jaar een echte tiebreaker
  toevoegen (bijvoorbeeld hoogste dagscore, aantal etappes met punten, of juist
  de jokerscore).
- **De jokerregel doet er alleen bovenin toe.** Met de bonus meegeteld wint
  Sylvia met 1,06 punt verschil. Dat is precies het scenario waarvoor de
  jokerregel bedoeld is — reden om hem volgend jaar of echt te implementeren,
  of bewust te schrappen.

## Bugs / techniek

- **`round()` werkt niet direct op de puntenviews.** `weighted_points` in
  `user_stage_points` is `double precision` (gevolg van `sqrt()` in de
  wortelweging), en Postgres kent `round(x, 2)` alleen voor `numeric`. Een
  query als `round(usp.weighted_points, 2)` faalt met
  `ERROR 42883: function round(double precision, integer) does not exist`.
  Werk met een expliciete cast (`::numeric`), of overweeg de views zelf
  `numeric` te laten teruggeven zodat afronden overal gewoon werkt.

## Data-toegang

- Er was geen live Supabase-toegang beschikbaar in de Claude Code-sessie
  (geen `.env.local`, en de egress-policy van de sessie blokkeerde
  `*.supabase.co` sowieso). Voor volgend jaar is het handig om vooraf te
  bepalen hoe/of Claude tijdens de Tour queries op de live database moet
  kunnen draaien (bijv. via een read-only rapportage-key), zodat dit niet
  ad-hoc via het dashboard hoeft.
