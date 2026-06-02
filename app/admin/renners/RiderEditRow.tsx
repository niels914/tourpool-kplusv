"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Rider = {
  id: string;
  bib_number: number;
  bib_digit: number;
  full_name: string;
  team_name: string;
  nationality: string | null;
  is_dns: boolean;
  is_dnf: boolean;
};

export function RiderEditRow({ rider }: { rider: Rider }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggleDns() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("riders").update({ is_dns: !rider.is_dns }).eq("id", rider.id);
    router.refresh();
    setLoading(false);
  }

  async function toggleDnf() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("riders").update({ is_dnf: !rider.is_dnf }).eq("id", rider.id);
    router.refresh();
    setLoading(false);
  }

  return (
    <tr className={`border-b border-[#F3F4F6] ${rider.is_dns || rider.is_dnf ? "opacity-50" : ""}`}>
      <td className="px-4 py-2.5 font-medium text-[#374151]">
        {rider.bib_number}
      </td>
      <td className="px-4 py-2.5">
        <span className="font-medium text-[#111827]">{rider.full_name}</span>
        {rider.nationality && (
          <span className="ml-1.5 text-xs text-[#6B7280]">{rider.nationality}</span>
        )}
      </td>
      <td className="hidden px-4 py-2.5 text-[#6B7280] sm:table-cell">
        {rider.team_name}
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className="flex h-6 w-6 mx-auto items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-bold text-[#FFD700]">
          {rider.bib_digit}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        {rider.is_dns ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">DNS</span>
        ) : rider.is_dnf ? (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">DNF</span>
        ) : (
          <span className="rounded-full bg-[#EDE8F5] px-2 py-0.5 text-xs font-medium text-[#5760A6]">Start</span>
        )}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex gap-1">
          <button
            onClick={toggleDns}
            disabled={loading}
            className="rounded px-2 py-0.5 text-xs text-[#6B7280] hover:bg-[#F3F4F6]"
          >
            {rider.is_dns ? "DNS ongedaan" : "DNS"}
          </button>
          <button
            onClick={toggleDnf}
            disabled={loading}
            className="rounded px-2 py-0.5 text-xs text-[#6B7280] hover:bg-[#F3F4F6]"
          >
            {rider.is_dnf ? "DNF ongedaan" : "DNF"}
          </button>
        </div>
      </td>
    </tr>
  );
}
