import { STAGE_FINISH_POINTS, JERSEY_POINTS, FINAL_BONUS_POINTS } from "@/lib/scoring";

export default function SpelregelsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-3xl font-bold text-[#1A1A1A]">Spelregels</h1>
      <p className="mb-8 text-[#6B7280]">KplusV Tourpool 2026 — Tour de France, 27 juni t/m 20 juli 2026</p>

      {/* Inleiding */}
      <Section title="Over de pool">
        <p>
          Met z'n allen voorspellen welke renners de Tour de France 2026 domineren — en slim
          kiezen loont. Inschrijfgeld is <strong>€5</strong> per deelnemer. De winnaar trakteert.
        </p>
      </Section>

      {/* Ploeg samenstellen */}
      <Section title="Ploeg samenstellen">
        <p className="mb-4">
          Elke deelnemer stelt een ploeg van <strong>8 renners</strong> samen. De truc: je kiest
          precies één renner per eindcijfer van het rugnummer:
        </p>
        <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {[1,2,3,4,5,6,7,8].map((d) => (
            <div key={d} className="rounded-lg border border-[#E2DFF0] bg-white p-2 text-center">
              <div className="text-lg font-bold text-[#FFD700]" style={{ WebkitTextStroke: "1px #1A1A1A" }}>…{d}</div>
              <div className="text-xs text-[#6B7280]">slot {d}</div>
            </div>
          ))}
        </div>
        <p className="mb-2">
          Rugnummer <strong>1</strong> gaat in slot 1, rugnummer <strong>12</strong> in slot 2,
          rugnummer <strong>53</strong> in slot 3, enzovoort.
          Rugnummers die eindigen op 9 of 0 komen niet voor in de Tour — die slots bestaan niet.
        </p>
        <p>
          Je keuze is definitief na de deadline:{" "}
          <strong>zaterdag 4 juli 2026 om 12:01 Nederlandse tijd</strong>. Daarna zijn je keuzes
          vergrendeld.
        </p>
      </Section>

      {/* Dagelijkse punten */}
      <Section title="Punten per etappe">
        <p className="mb-4">
          Voor elke vergrendelde etappe (TTT-etappes tellen niet mee) verdienen jouw renners
          punten in vijf categorieën:
        </p>

        <h3 className="mb-2 font-semibold text-[#111827]">Etappeuitslag (top 10)</h3>
        <PointsTable
          headers={["Positie", "Punten"]}
          rows={STAGE_FINISH_POINTS.slice(1).map((pts, i) => [`${i + 1}e`, pts.toString()])}
        />

        <h3 className="mb-2 mt-6 font-semibold text-[#111827]">Klassementen per etappe (top 3)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2DFF0] text-[#6B7280]">
                <th className="pb-2 text-left">Klassement</th>
                <th className="pb-2 text-center">1e</th>
                <th className="pb-2 text-center">2e</th>
                <th className="pb-2 text-center">3e</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "🟡 Geel (algemeen)", key: "gc_standing" },
                { label: "🔴 Bolletjes (berg)", key: "mountain_standing" },
                { label: "🟢 Groen (punten)", key: "sprint_standing" },
                { label: "⚪ Wit (jongeren)", key: "white_standing" },
              ].map(({ label, key }) => (
                <tr key={key} className="border-b border-[#F3F4F6]">
                  <td className="py-2">{label}</td>
                  {JERSEY_POINTS[key].slice(1).map((pts, i) => (
                    <td key={i} className="py-2 text-center font-medium">{pts}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Eindbonus */}
      <Section title="Bonuspunten eindklassement">
        <p className="mb-4">
          Na afloop van de Tour worden bonuspunten uitgedeeld op basis van de eindstanden:
        </p>

        <h3 className="mb-2 font-semibold text-[#111827]">Algemeen klassement (top 10)</h3>
        <PointsTable
          headers={["Positie", "Punten"]}
          rows={FINAL_BONUS_POINTS.final_gc.slice(1).map((pts, i) => [`${i + 1}e`, pts.toString()])}
        />

        <h3 className="mb-2 mt-6 font-semibold text-[#111827]">Berg-, punten- en jongerenklassement (top 5)</h3>
        <PointsTable
          headers={["Positie", "Punten"]}
          rows={FINAL_BONUS_POINTS.final_mountain.slice(1).map((pts, i) => [`${i + 1}e`, pts.toString()])}
        />
      </Section>

      {/* Wortel */}
      <Section title="De wortelregel — slim kiezen loont">
        <p className="mb-4">
          Alle punten worden gedeeld door de <strong>wortel van het aantal deelnemers</strong> dat
          dezelfde renner heeft gekozen. Hoe minder populair een renner, hoe meer jij verdient als
          hij presteert.
        </p>
        <div className="mb-4 rounded-xl bg-[#EDE8F5] p-5 text-sm">
          <p className="mb-2 font-semibold">Voorbeeld:</p>
          <p>
            Pogacar wordt gekozen door <strong>9 deelnemers</strong>. Hij wint de etappe (15
            punten). Jij krijgt: 15 ÷ √9 = 15 ÷ 3 ={" "}
            <strong>5 punten</strong>.
          </p>
          <p className="mt-2">
            Een onbekende renner die jij als enige kiest wint dezelfde etappe. Jij krijgt: 15 ÷
            √1 = 15 ÷ 1 = <strong>15 punten</strong> — drie keer zoveel!
          </p>
        </div>
        <p className="text-sm text-[#6B7280]">
          De wortelregel geldt voor zowel dagelijkse punten als de eindklassementbonus.
        </p>
      </Section>

      {/* Overige regels */}
      <Section title="Overige regels">
        <ul className="list-inside list-disc space-y-2 text-sm">
          <li>
            <strong>TTT (ploegentijdrit)</strong> telt niet mee voor de punten — wel weergegeven
            in het schema.
          </li>
          <li>
            Als een renner uitvalt (<strong>DNF</strong>) of niet start (<strong>DNS</strong>),
            verdient hij geen punten meer. Punten die al zijn verdiend blijven staan.
          </li>
          <li>
            Diskwalificaties <em>na</em> de officiële uitslag worden niet teruggedraaid.
          </li>
          <li>
            Officiële uitslagen komen van ProCyclingStats en worden door de poolbeheerder
            gecontroleerd voordat ze worden vergrendeld.
          </li>
          <li>
            Bij geschillen beslist de poolbeheerder. Diens beslissing is definitief.
          </li>
        </ul>
      </Section>

      <p className="mt-8 text-xs text-[#6B7280]">
        Spelregels KplusV Tourpool 2026 — bijgewerkt op basis van het reglement 2022.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 border-l-4 border-[#9462A6] pl-3 text-xl font-bold text-[#1A1A1A]">
        {title}
      </h2>
      <div className="text-[#374151] leading-relaxed">{children}</div>
    </section>
  );
}

function PointsTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E2DFF0] text-[#6B7280]">
            {headers.map((h) => (
              <th key={h} className="pb-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#F3F4F6]">
              {row.map((cell, j) => (
                <td key={j} className={`py-1.5 ${j > 0 ? "font-medium" : ""}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
