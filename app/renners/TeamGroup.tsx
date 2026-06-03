"use client";

import { useState } from "react";
import Link from "next/link";
import { RiderPhoto, TeamLogo } from "./RiderImage";
import { getTeamColors } from "@/lib/teamColors";

/** Zet ISO alpha-2 landcode om naar vlag-emoji */
function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/[A-Z]/g, (c) => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6));
}

type Rider = {
  id: string;
  bib_number: number;
  bib_digit: number;
  full_name: string;
  team_name: string;
  nationality: string | null;
  pcs_slug: string | null;
  is_dns: boolean;
  is_dnf: boolean;
};

type Props = {
  teamName: string;
  riders: Rider[];
  countByRider: Record<string, number>;
  rawByRider: Record<string, number>;
  showPicks: boolean;
  hasPoints: boolean;
  teamSlug: string;
  defaultOpen?: boolean;
};

export function TeamGroup({
  teamName,
  riders,
  countByRider,
  rawByRider,
  showPicks,
  hasPoints,
  teamSlug,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [color1, color2] = getTeamColors(teamSlug);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full border-b border-[#E2DFF0] px-4 py-3 flex items-center gap-3 transition text-left hover:brightness-95"
        style={{
          background: `linear-gradient(135deg, ${color1}18 0%, ${color2}10 60%, #F3F1FA 100%)`,
          borderLeft: `4px solid ${color1}`,
        }}
      >
        <TeamLogo teamSlug={teamSlug} teamName={teamName} />
        <h2 className="flex-1 font-semibold text-[#111827]">{teamName}</h2>
        <span className="text-xs text-[#9CA3AF] mr-1">{riders.length}</span>
        <svg
          className={`h-4 w-4 text-[#9CA3AF] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="divide-y divide-[#F3F4F6]">
          {riders.map((rider) => {
            const picks = countByRider[rider.id] ?? 0;
            const isOut = rider.is_dns || rider.is_dnf;
            const raw = rawByRider[rider.id] ?? 0;
            const pickCount = Math.max(countByRider[rider.id] ?? 1, 1);
            const weighted = raw / Math.sqrt(pickCount);

            return (
              <Link
                key={rider.id}
                href={`/renners/${rider.id}`}
                className={`grid items-center gap-2 px-4 py-2.5 transition hover:bg-[#F8F7FC] ${
                  isOut ? "opacity-40" : ""
                }`}
                style={{ gridTemplateColumns: "32px 32px 1fr auto auto" }}
              >
                {/* Foto */}
                <RiderPhoto pcsSlug={rider.pcs_slug ?? null} name={rider.full_name} />

                {/* Rugnummer */}
                <span className="flex h-6 w-8 items-center justify-center rounded-full bg-[#5760A6] text-xs font-bold text-white">
                  {rider.bib_number}
                </span>

                {/* Naam + vlag + status */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-medium text-[#111827] truncate">{rider.full_name}</span>
                  {rider.nationality && (
                    <span className="text-base leading-none" title={rider.nationality}>
                      {flagEmoji(rider.nationality)}
                    </span>
                  )}
                  {rider.is_dns && (
                    <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 shrink-0">DNS</span>
                  )}
                  {rider.is_dnf && (
                    <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700 shrink-0">DNF</span>
                  )}
                </div>

                {/* Gewogen punten */}
                {hasPoints ? (
                  <div className="flex flex-col items-end w-16 shrink-0">
                    <span className="text-sm font-semibold text-[#111827]">
                      {weighted > 0 ? weighted.toFixed(2) : "—"}
                    </span>
                    {weighted > 0 && (
                      <span className="text-xs text-[#9CA3AF]">ptn</span>
                    )}
                  </div>
                ) : (
                  <div className="w-16 shrink-0" />
                )}

                {/* Pick-teller */}
                <div className="flex items-center justify-end w-28 shrink-0">
                  {showPicks ? (
                    <PickBar count={picks} />
                  ) : (
                    <span className="text-xs text-[#6B7280]">slot …{rider.bib_digit}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PickBar({ count }: { count: number }) {
  const MAX = 5;
  const width = Math.min((count / MAX) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <div className="hidden w-20 overflow-hidden rounded-full bg-[#E2DFF0] sm:block" style={{ height: 6 }}>
        <div
          className="h-full rounded-full bg-[#9462A6] transition-all"
          style={{ width: count > 0 ? `${width}%` : "0%" }}
        />
      </div>
      <span
        className={`min-w-[2rem] rounded-full px-2.5 py-0.5 text-center text-xs font-semibold ${
          count > 0 ? "bg-[#EDE8F5] text-[#5760A6]" : "bg-[#F3F4F6] text-[#9CA3AF]"
        }`}
      >
        {count}×
      </span>
    </div>
  );
}
