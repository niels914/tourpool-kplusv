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

## Data-toegang

- Er was geen live Supabase-toegang beschikbaar in de Claude Code-sessie
  (geen `.env.local`, en de egress-policy van de sessie blokkeerde
  `*.supabase.co` sowieso). Voor volgend jaar is het handig om vooraf te
  bepalen hoe/of Claude tijdens de Tour queries op de live database moet
  kunnen draaien (bijv. via een read-only rapportage-key), zodat dit niet
  ad-hoc via het dashboard hoeft.
