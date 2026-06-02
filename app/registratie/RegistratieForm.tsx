"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Rider = {
  id: string;
  full_name: string;
  team_name: string;
  bib_number: number;
  nationality: string | null;
  bib_digit: number;
  is_dns: boolean;
  is_dnf: boolean;
};

type Pick = {
  bib_slot: number;
  rider_id: string;
  riders: { id: string; full_name: string; team_name: string; bib_number: number; nationality: string | null } | null;
};

const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];

export function RegistratieForm({
  riders,
  currentPicks,
  userId,
}: {
  riders: Rider[];
  currentPicks: Pick[];
  userId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialSelections: Record<number, string | null> = {};
  SLOTS.forEach((slot) => {
    const pick = currentPicks.find((p) => p.bib_slot === slot);
    initialSelections[slot] = pick?.rider_id ?? null;
  });

  const [selections, setSelections] = useState<Record<number, string | null>>(initialSelections);
  const [saving, setSaving] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const ridersBySlot: Record<number, Rider[]> = {};
  SLOTS.forEach((slot) => {
    ridersBySlot[slot] = riders.filter((r) => r.bib_digit === slot);
  });

  const selectedIds = new Set(Object.values(selections).filter(Boolean));
  const filledSlots = SLOTS.filter((s) => selections[s]).length;
  const allFilled = filledSlots === 8;

  async function handleSave() {
    if (!allFilled) return;
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    await supabase.from("team_picks").delete().eq("user_id", userId);

    const inserts = SLOTS.map((slot) => ({
      user_id: userId,
      rider_id: selections[slot]!,
      bib_slot: slot,
    }));

    const { error } = await supabase.from("team_picks").insert(inserts);

    if (error) {
      setMessage({ type: "error", text: "Opslaan mislukt. Probeer opnieuw." });
    } else {
      setMessage({ type: "success", text: "Ploeg opgeslagen!" });
      startTransition(() => router.refresh());
    }
    setSaving(false);
  }

  function selectRider(slot: number, riderId: string) {
    setSelections((prev) => ({ ...prev, [slot]: riderId }));
    setActiveSlot(null);
    setSearch("");
  }

  function clearSlot(slot: number) {
    setSelections((prev) => ({ ...prev, [slot]: null }));
  }

  const activeRiders = activeSlot
    ? (ridersBySlot[activeSlot] ?? []).filter(
        (r) =>
          r.full_name.toLowerCase().includes(search.toLowerCase()) ||
          r.team_name.toLowerCase().includes(search.toLowerCase()) ||
          r.bib_number.toString().includes(search)
      )
    : [];

  return (
    <div>
      {/* Voortgangsbalk */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1 overflow-hidden rounded-full bg-[#E2DFF0]">
          <div
            className="h-2 rounded-full bg-[#9462A6] transition-all"
            style={{ width: `${(filledSlots / 8) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-[#374151]">{filledSlots}/8 slots</span>
      </div>

      {/* Slots grid */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SLOTS.map((slot) => {
          const selectedId = selections[slot];
          const selectedRider = selectedId
            ? riders.find((r) => r.id === selectedId)
            : null;

          return (
            <div
              key={slot}
              className={`rounded-xl border-2 p-3 transition ${
                selectedRider
                  ? "border-[#9462A6] bg-[#EDE8F5]"
                  : activeSlot === slot
                  ? "border-[#5760A6] bg-[#EDE8F5]/50"
                  : "border-[#E2DFF0] bg-white"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5760A6] text-xs font-bold text-white">
                  …{slot}
                </span>
                {selectedRider && (
                  <button
                    onClick={() => clearSlot(slot)}
                    className="text-xs text-[#6B7280] hover:text-red-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {selectedRider ? (
                <div>
                  <p className="font-semibold text-[#111827] text-sm leading-tight">
                    {selectedRider.full_name}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    #{selectedRider.bib_number} · {selectedRider.team_name}
                  </p>
                  <button
                    onClick={() => { setActiveSlot(slot); setSearch(""); }}
                    className="mt-2 text-xs text-[#9462A6] underline"
                  >
                    Wijzigen
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setActiveSlot(slot === activeSlot ? null : slot); setSearch(""); }}
                  className="w-full rounded-lg border border-dashed border-[#B8AED6] py-2 text-xs text-[#6B7280] hover:border-[#9462A6] hover:text-[#5760A6]"
                >
                  + Renner kiezen
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Renner-picker modal */}
      {activeSlot !== null && (
        <div className="mb-6 rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
          <div className="border-b border-[#E2DFF0] px-4 py-3">
            <p className="font-semibold text-[#111827]">
              Slot …{activeSlot} — kies een renner
            </p>
            <input
              autoFocus
              type="text"
              placeholder="Zoek op naam, ploeg of rugnummer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#E2DFF0] px-3 py-2 text-sm outline-none focus:border-[#9462A6]"
            />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {activeRiders.length === 0 ? (
              <p className="px-4 py-4 text-sm text-[#6B7280]">Geen renners gevonden.</p>
            ) : (
              activeRiders.map((rider) => {
                const alreadyPicked = selectedIds.has(rider.id) && selections[activeSlot] !== rider.id;
                return (
                  <button
                    key={rider.id}
                    disabled={alreadyPicked}
                    onClick={() => selectRider(activeSlot, rider.id)}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-[#F8F7FC] ${
                      alreadyPicked ? "opacity-40 cursor-not-allowed" : ""
                    } ${selections[activeSlot] === rider.id ? "bg-[#EDE8F5]" : ""}`}
                  >
                    <div>
                      <span className="font-medium text-[#111827]">{rider.full_name}</span>
                      <span className="ml-2 text-xs text-[#6B7280]">
                        #{rider.bib_number} · {rider.team_name}
                      </span>
                    </div>
                    {rider.nationality && (
                      <span className="text-xs text-[#6B7280]">{rider.nationality}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Opslaan */}
      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${
            message.type === "success"
              ? "bg-[#EDE8F5] text-[#5760A6]"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!allFilled || saving || isPending}
        className="w-full rounded-xl bg-[#9462A6] py-3 text-sm font-semibold text-white transition hover:bg-[#5760A6] disabled:opacity-40"
      >
        {saving ? "Opslaan…" : allFilled ? "Ploeg opslaan →" : `Nog ${8 - filledSlots} slot${8 - filledSlots > 1 ? "s" : ""} leeg`}
      </button>
    </div>
  );
}
