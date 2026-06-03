"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getAvatar } from "@/lib/profiles";

type DataPoint = {
  stage_number: number;
  user_id: string;
  cumulative_points: number;
};

type Profile = {
  user_id: string;
  display_name: string;
  nickname?: string | null;
  avatar_id?: number | null;
};

type Props = {
  data: DataPoint[];
  profiles: Profile[];
};

function getColor(uid: string, profiles: Profile[]): string {
  const p = profiles.find((x) => x.user_id === uid);
  return getAvatar(p?.avatar_id).bg;
}

export function PuntenGrafiek({ data, profiles }: Props) {
  const userIds = Array.from(new Set(data.map((d) => d.user_id)));
  const [active, setActive] = useState<Set<string>>(new Set(userIds));

  const stageNumbers = Array.from(new Set(data.map((d) => d.stage_number))).sort((a, b) => a - b);

  // Bouw chart data: één object per etappe met een key per user.
  // Als een user geen punten scoort in een etappe, draag de vorige waarde door
  // zodat de lijn horizontaal doorloopt in plaats van te breken.
  const lastKnown: Record<string, number> = {};
  const chartData = stageNumbers.map((stage) => {
    const obj: Record<string, number | string> = { stage: `E${stage}` };
    for (const uid of userIds) {
      const point = data.find((d) => d.stage_number === stage && d.user_id === uid);
      if (point) {
        lastKnown[uid] = Number(point.cumulative_points);
      }
      obj[uid] = Number((lastKnown[uid] ?? 0).toFixed(2));
    }
    return obj;
  });

  function getLabel(uid: string) {
    const p = profiles.find((x) => x.user_id === uid);
    if (!p) return uid;
    // Initialen: eerste letter voornaam + eerste letter achternaam
    const parts = p.display_name.trim().split(/\s+/);
    const initials =
      (parts[0]?.[0] ?? "").toUpperCase() +
      (parts.length > 1 ? (parts[parts.length - 1][0] ?? "").toUpperCase() : "");
    if (p.nickname) return `${p.nickname} - ${initials}`;
    return initials || p.display_name;
  }

  function toggle(uid: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  if (stageNumbers.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border border-[#E2DFF0] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#111827]">Puntenverloop</h2>

      {/* Deelnemer-toggles */}
      <div className="mb-4 flex flex-wrap gap-2">
        {userIds.map((uid) => {
          const on = active.has(uid);
          const color = getColor(uid, profiles);
          return (
            <button
              key={uid}
              onClick={() => toggle(uid)}
              className="rounded-full px-3 py-1 text-xs font-medium transition"
              style={{
                backgroundColor: on ? color : "#F3F4F6",
                color: on ? "#fff" : "#6B7280",
                border: `2px solid ${on ? color : "#E5E7EB"}`,
              }}
            >
              {getLabel(uid)}
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F1FA" />
          <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} width={45} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #E2DFF0", fontSize: 12 }}
            {...{
              formatter: (value: number, uid: string) =>
                [Number(value).toFixed(2), getLabel(uid)],
            } as object}
          />
          {userIds.map((uid) =>
            active.has(uid) ? (
              <Line
                key={uid}
                type="monotone"
                dataKey={uid}
                stroke={getColor(uid, profiles)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
