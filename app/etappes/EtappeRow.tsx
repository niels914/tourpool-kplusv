"use client";

import { useRouter } from "next/navigation";

type Props = {
  id: string;
  isClickable: boolean;
  stageNumber: number;
  stageDate: string;
  departure: string | null;
  arrival: string | null;
  profileLabel: string;
  profileEmoji: string;
  profileColor: string;
  distanceKm: number | null;
  statusLabel: string;
  statusColor: string;
};

export function EtappeRow({
  id, isClickable, stageNumber, stageDate, departure, arrival,
  profileLabel, profileEmoji, profileColor, distanceKm, statusLabel, statusColor,
}: Props) {
  const router = useRouter();

  return (
    <tr
      className={`border-b border-[#F3F4F6] ${isClickable ? "cursor-pointer hover:bg-[#F8F7FC]" : ""}`}
      onClick={isClickable ? () => router.push(`/etappes/${id}`) : undefined}
    >
      <td className="px-4 py-3 font-medium text-[#111827]">{stageNumber}</td>
      <td className="px-4 py-3 text-[#374151]">
        {new Date(stageDate).toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "short",
        })}
      </td>
      <td className="hidden px-4 py-3 text-[#374151] sm:table-cell">
        {departure && arrival ? `${departure} → ${arrival}` : "—"}
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${profileColor}`}>
          {profileEmoji} {profileLabel}
        </span>
      </td>
      <td className="hidden px-4 py-3 text-right text-[#6B7280] md:table-cell">
        {distanceKm ? `${distanceKm} km` : "—"}
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </td>
    </tr>
  );
}
