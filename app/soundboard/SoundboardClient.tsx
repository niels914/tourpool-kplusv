"use client";

import {
  playKlaxon,
  playChuteChute,
  playRodania,
  playFietstoeter,
  playWaterVergiften,
} from "@/lib/soundboard";

const SOUNDS: { icon: string; label: string; play: () => void }[] = [
  { icon: "📯", label: "Karavaan-claxon", play: playKlaxon },
  { icon: "🚨", label: "Chute, chute!", play: playChuteChute },
  { icon: "🔴", label: "Rodania (rode lantaarn)", play: playRodania },
  { icon: "🚲", label: "Fietstoeter / luchthoorn", play: playFietstoeter },
  { icon: "🥤", label: "Water?!", play: playWaterVergiften },
];

export function SoundboardClient() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {SOUNDS.map((s, i) => (
        <button
          key={i}
          onClick={s.play}
          className="flex flex-col items-center gap-2 rounded-2xl border border-[#E2DFF0] bg-white p-4 shadow-sm transition hover:bg-[#F8F7FC] hover:shadow active:scale-95"
        >
          <span className="text-3xl">{s.icon}</span>
          <span className="text-center text-sm font-medium text-[#374151]">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
