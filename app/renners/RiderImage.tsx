"use client";

import { useState } from "react";

const AVATAR_COLORS = [
  { bg: "#EDE8F5", text: "#5760A6" },
  { bg: "#E0EBF5", text: "#1D6FA6" },
  { bg: "#E8F5ED", text: "#1A7A44" },
  { bg: "#F5EDE8", text: "#A66020" },
  { bg: "#F5E8EF", text: "#A6205A" },
  { bg: "#E8EDF5", text: "#2040A6" },
  { bg: "#F0EDE8", text: "#7A5C1A" },
  { bg: "#E8F5F5", text: "#1A7A7A" },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarColor(name: string) {
  const code = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export function RiderAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const { bg, text } = getAvatarColor(name);
  const cls = size === "sm"
    ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold";
  return (
    <div className={cls} style={{ backgroundColor: bg, color: text }}>
      {getInitials(name)}
    </div>
  );
}

export function RiderPhoto({ name }: { name: string }) {
  return <RiderAvatar name={name} />;
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
