"use client";

import { useState } from "react";

export function RiderPhoto({ pcsSlug, name }: { pcsSlug: string | null; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!pcsSlug || failed) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE8F5] text-xs font-bold text-[#9462A6]">
        {name.charAt(0)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/rider-image/${pcsSlug}`}
      alt={name}
      onError={() => setFailed(true)}
      className="h-10 w-10 shrink-0 rounded-full object-cover object-top border border-[#E2DFF0]"
    />
  );
}

export function TeamLogo({ teamSlug, teamName }: { teamSlug: string; teamName: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/team-logo/${teamSlug}`}
      alt={teamName}
      onError={() => setFailed(true)}
      className="h-7 w-auto max-w-[80px] object-contain drop-shadow-sm"
    />
  );
}
