import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const MESSAGES = [
  "Goedemorgen iedereen! Ben benieuwd wie er dit jaar gaat winnen 🚴",
  "Ik heb vol ingezet op Pogacar. Die man is gewoon niet te stoppen.",
  "Zelf voor Vingegaard gegaan. Denk dat hij revanche wil nemen dit jaar.",
  "Wie heeft er eigenlijk een renner van Visma gepakt voor slot 1?",
  "Ik ga voor de underdogs dit jaar. Laat die Wout maar lekker sprinten.",
  "De bergen worden weer cruciaal denk ik. Pyreneeën zien er zwaar uit.",
  "Heeft iemand de tijdritspecialist van slot 7 gepakt? Kan veel punten opleveren.",
  "Ik was te laat met mijn ploeg registreren bijna 😅 net op tijd!",
  "Wie denkt dat er dit jaar een Nederlander meedoet voor de eindzege?",
  "Super spannend dit jaar! Mijn renners zien er goed uit op papier.",
  "Eerste etappe al bijna! Zin in de komende weken.",
  "Ik heb slim gekozen hoor, allemaal renners die niemand kent 😏 wortelregel baby",
  "Haha ja die wortelregel is echt een gamechanger. Populaire renners zijn niet altijd slim.",
  "Klopt, maar als Pogacar elke etappe wint dan is ie alsnog de beste keuze",
  "We gaan het zien! Succes allemaal 🏆",
  "Zijn de tijdritten ook meegenomen in de punten?",
  "Ja maar TTT niet, dat staat in de spelregels.",
  "Ah oke dankje. Dan is de proloog wel interessant.",
  "Mooi systeem trouwens, veel leuker dan de oude Excel.",
  "Eens! Fijn dat je dit hebt gemaakt Niels 👍",
  "Ik check dagelijks mijn positie in het klassement haha",
  "Wie staat er bovenaan? Ik durf al niet meer te kijken na etappe 3...",
  "Ik zit in de top 3! Niet zeggen wie want ik wil de spanning erin houden 😄",
  "Ik heb een renner die uitgevallen is... dat kost me veel punten helaas.",
  "Balen zeg. DNS of DNF?",
  "DNF in de tweede etappe al. Pech.",
  "Vorig jaar had ik ook pech met uitvallers. Dit jaar heb ik bewust veilig gekozen.",
  "Slim! Ik ga weer all-in zoals altijd. Hoog risico hoog rendement 😅",
  "Welke etappe wordt jullie favoriet dit jaar?",
  "De koninginnenrit in de Alpen lijkt me episch dit jaar.",
];

export async function POST() {
  const supabase = await createClient();

  // Check admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

  // Haal alle profielen op voor afwisselende afzenders
  const { data: profiles } = await supabase.from("profiles").select("id");
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ error: "Geen profielen gevonden" }, { status: 400 });
  }

  // Verwijder bestaande dummy berichten (optioneel — comment uit om te bewaren)
  await supabase.from("messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Voeg berichten in met gespreide tijdstippen (afgelopen 7 dagen)
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const toInsert = MESSAGES.map((content, i) => {
    const profileIndex = i % profiles.length;
    const ago = sevenDaysMs - (i / MESSAGES.length) * sevenDaysMs;
    return {
      user_id: profiles[profileIndex].id,
      content,
      created_at: new Date(now - ago).toISOString(),
    };
  });

  const { error } = await supabase.from("messages").insert(toInsert);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, inserted: toInsert.length });
}
