import { SoundboardClient } from "./SoundboardClient";

export default function SoundboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-3xl font-bold text-[#111827]">Soundboard 🔊</h1>
      <p className="mb-8 text-[#6B7280]">
        Typische Tour-sfeergeluiden — druk op een knop en laat de karavaan los.
      </p>
      <SoundboardClient />
    </div>
  );
}
