"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AVATARS, NICKNAMES } from "@/lib/profiles";

type Props = {
  userId: string;
  currentAvatarId: number;
  currentNickname: string | null;
  takenNicknames: string[];
};

export function ProfileEditor({ userId, currentAvatarId, currentNickname, takenNicknames }: Props) {
  const [open, setOpen] = useState(false);
  const [avatarId, setAvatarId] = useState(currentAvatarId);
  const [nickname, setNickname] = useState<string | null>(currentNickname);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const availableNicknames = NICKNAMES.filter(
    (n) => n === currentNickname || !takenNicknames.includes(n)
  );

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ avatar_id: avatarId, nickname: nickname || null })
      .eq("id", userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mb-8 rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
            style={{ backgroundColor: AVATARS.find((a) => a.id === avatarId)?.bg ?? "#5760A6" }}
          >
            {AVATARS.find((a) => a.id === avatarId)?.emoji ?? "🚴"}
          </span>
          <div>
            <p className="text-sm font-semibold text-[#111827]">
              {nickname ?? "Geen bijnaam"}
            </p>
            <p className="text-xs text-[#6B7280]">Avatar &amp; bijnaam aanpassen</p>
          </div>
        </div>
        <span className="text-[#9CA3AF]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-[#E2DFF0] px-5 py-5 space-y-5">
          {/* Avatar kiezen */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Avatar</p>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAvatarId(a.id)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${
                    avatarId === a.id ? "ring-2 ring-[#9462A6] ring-offset-2" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: a.bg }}
                  title={`Avatar ${a.id}`}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Bijnaam kiezen */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Bijnaam</p>
            <select
              value={nickname ?? ""}
              onChange={(e) => setNickname(e.target.value || null)}
              className="w-full rounded-xl border border-[#E2DFF0] px-3 py-2 text-sm focus:border-[#9462A6] focus:outline-none focus:ring-2 focus:ring-[#EDE8F5]"
            >
              <option value="">Geen bijnaam</option>
              {availableNicknames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[#9CA3AF]">Elke bijnaam kan maar door één deelnemer worden gekozen.</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#9462A6] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5760A6] disabled:opacity-50 transition"
          >
            {saved ? "✓ Opgeslagen" : saving ? "Opslaan…" : "Opslaan"}
          </button>
        </div>
      )}
    </div>
  );
}
