const SUPABASE_URL = "https://gesezveoznxegrjuhriz.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc2V6dmVvem54ZWdyanVocml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM1NzM1NywiZXhwIjoyMDk1OTMzMzU3fQ.WCdHALe9Fs8Xz1XuDFetNe-cY2qAPP-Qx0TxkhaKIs0";

const profiles = [
  "94eb35b3-92a5-4bc0-933c-02694d5bd9f4",
  "0d140ebb-789e-4047-b8ad-3df4fc3e3c0b",
  "1d0a9d57-05d2-4121-a05a-06020e661322",
  "1669c382-aaf3-49f0-8443-b894175ecb44",
  "4b4b8843-f616-4f52-8e69-524bf3c14950",
  "faff8825-2ef5-4acd-8109-cc03df466bb3",
  "5530994b-5383-4458-89d8-3c2d56bad58c",
  "614441a7-cd81-4497-a756-9e2db59d927f",
  "f0db3f45-4818-47d6-9f5c-0c4fa4ed1051",
  "9e8dadfe-7217-4ef4-bd8f-827f271ee28f",
  "c97eab8b-306a-441d-8f8c-1028879f29f1",
  "5e74cfa4-de82-40a5-8f7e-5a528a5ed6d3",
];

const MESSAGES = [
  "Goedemorgen iedereen! Ben benieuwd wie er dit jaar gaat winnen 🚴",
  "Ik heb vol ingezet op Pogacar. Die man is gewoon niet te stoppen.",
  "Zelf voor Vingegaard gegaan. Denk dat hij revanche wil nemen dit jaar.",
  "Wie heeft er eigenlijk een renner van UAE gepakt voor slot 1?",
  "Ik ga voor de underdogs dit jaar. Die wortelregel speelt in mijn voordeel 😏",
  "De bergen worden weer cruciaal denk ik. Pyreneeën zien er zwaar uit.",
  "Heeft iemand de tijdritspecialist van slot 7 gepakt? Kan veel punten opleveren.",
  "Ik was te laat met mijn ploeg registreren bijna 😅 net op tijd!",
  "Wie denkt dat er dit jaar een Nederlander meedoet voor de eindzege?",
  "Super spannend dit jaar! Mijn renners zien er goed uit op papier.",
  "Eerste etappe al bijna! Zin in de komende weken.",
  "Ik heb slim gekozen hoor, allemaal renners die niemand kent 😏",
  "Haha ja die wortelregel is echt een gamechanger. Populaire renners zijn niet altijd slim.",
  "Klopt, maar als Pogacar elke etappe wint dan is ie alsnog de beste keuze",
  "We gaan het zien! Succes allemaal 🏆",
  "Zijn de tijdritten ook meegenomen in de punten?",
  "Ja maar TTT niet, dat staat in de spelregels.",
  "Ah oke dankje. Dan is de proloog wel interessant.",
  "Mooi systeem trouwens, veel leuker dan de oude Excel.",
  "Eens! Fijn dat je dit hebt gemaakt 👍",
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

const now = Date.now();
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

const rows = MESSAGES.map((content, i) => ({
  user_id: profiles[i % profiles.length],
  content,
  created_at: new Date(now - sevenDaysMs + (i / MESSAGES.length) * sevenDaysMs).toISOString(),
}));

// Verwijder bestaande berichten
const del = await fetch(`${SUPABASE_URL}/rest/v1/messages?id=neq.00000000-0000-0000-0000-000000000000`, {
  method: "DELETE",
  headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
});
console.log("Deleted:", del.status);

// Voeg nieuwe berichten in
const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
  method: "POST",
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  },
  body: JSON.stringify(rows),
});
console.log("Inserted:", res.status, res.statusText);
if (!res.ok) console.error(await res.text());
else console.log(`✓ ${rows.length} berichten ingevoegd`);
