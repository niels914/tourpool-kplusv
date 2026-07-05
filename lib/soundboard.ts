// Afspelen van echte, door Niels aangeleverde audiofragmenten uit public/sounds/

function playAudioFile(path: string) {
  const audio = new Audio(path);
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
