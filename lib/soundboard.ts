// Afspelen van echte, door Niels aangeleverde audiofragmenten uit public/sounds/
// Er speelt maar één geluid tegelijk: een nieuwe klik stopt het vorige geluid direct,
// en opnieuw klikken op hetzelfde geluid start het gewoon opnieuw vanaf het begin.

let currentAudio: HTMLAudioElement | null = null;
let currentPath: string | null = null;

function playAudioFile(path: string) {
  if (currentAudio && currentPath === path) {
    currentAudio.currentTime = 0;
    currentAudio.play().catch(() => {});
    return;
  }

  currentAudio?.pause();

  const audio = new Audio(path);
  currentAudio = audio;
  currentPath = path;
  audio.play().catch(() => {});
}

// Karavaan-claxon
export function playKlaxon() {
  playAudioFile("/sounds/klaxon.mp3");
}

// "Chute, chute!" (koersradio)
export function playChuteChute() {
  playAudioFile("/sounds/chute.mp3");
}

// Rodania — het klassieke tijdsein-jingle, hier voor de rode lantaarn
export function playRodania() {
  playAudioFile("/sounds/rodania.mp3");
}

// Fietstoeter / luchthoorn
export function playFietstoeter() {
  playAudioFile("/sounds/fietstoeter.mp3");
}

// "Water?! Wil je me vergiften?!"
export function playWaterVergiften() {
  playAudioFile("/sounds/water-vergiften.mp3");
}

// "In het prikkeldraad"
export function playPrikkeldraad() {
  playAudioFile("/sounds/prikkeldraad.mp3");
}

// NOS-tune
export function playNosTune() {
  playAudioFile("/sounds/nos-tune.mp3");
}

// Karakter (Kenny van Hummel — vloeken in Verbier)
export function playKarakter() {
  playAudioFile("/sounds/karakter.mp3");
}
