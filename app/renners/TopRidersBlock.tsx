"use client";

import { useState } from "react";
import Link from "next/link";

type TopRider = {
  rider_id: string;
  full_name: string;
  bib_number: number;
  team_name: string;
  total_raw: number;
  pick_count: number;
};

type Props = {
  riders: TopRider[];
};

export function TopRidersBlock({ riders }: Props) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? riders : riders.slice(0, 5);

  return (
    <div className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-[#111827]">Top renners</h2>
      <div className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2DFF0] bg-[#F3F1FA]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Renner</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">Ploeg</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Punten</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Gekozen</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((rider, i) => (
              <tr key={rider.rider_id} className="border-b border-[#F3F4F6] transition hover:bg-[#F8F7FC]">
                <td className="px-4 py-3 text-sm text-[#6B7280]">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-8 items-center justify-center rounded bg-[#5760A6] text-xs font-bold text-white">
                      {rider.bib_number}
                    </span>
                    <Link
                      href={`/renners/${rider.rider_id}`}
                      className="font-medium text-[#111827] hover:text-[#9462A6] hover:underline"
                    >
                      {rider.full_name}
                    </Link>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-sm text-[#6B7280] sm:table-cell">{rider.team_name}</td>
                <td className="px-4 py-3 text-right font-semibold text-[#111827]">{rider.total_raw.toFixed(0)}</td>
                <td className="px-4 py-3 text-right text-sm text-[#6B7280]">{rider.pick_count}×</td>
              </tr>
            ))}
          </tbody>
        </table>

        {riders.length > 5 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-[#5760A6] hover:bg-[#F8F7FC] transition border-t border-[#E2DFF0]"
          >
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {expanded
              ? "Minder tonen"
              : `Alle ${riders.length} renners met punten tonen`}
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-[#6B7280]">
        Ruwe punten vóór wortelweging — renners met veel picks leveren individueel minder op.
      </p>
    </div>
  );
}
