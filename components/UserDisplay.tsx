import { getAvatar } from "@/lib/profiles";

type Profile = {
  display_name: string;
  nickname?: string | null;
  avatar_id?: number | null;
};

type Props = {
  profile: Profile;
  size?: "sm" | "md" | "lg";
  showRealName?: boolean;
  /** Compact: toont "BIJNAAM - VN" (initialen) i.p.v. "BIJNAAM aka volledige naam" */
  compact?: boolean;
};

function initials(displayName: string) {
  const parts = displayName.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "").toUpperCase() +
    (parts.length > 1 ? (parts[parts.length - 1][0] ?? "").toUpperCase() : "")
  );
}

export function UserDisplay({ profile, size = "md", showRealName = true, compact = false }: Props) {
  const avatar = getAvatar(profile.avatar_id);

  const avatarSize = size === "sm" ? "h-6 w-6 text-xs" : size === "lg" ? "h-10 w-10 text-lg" : "h-8 w-8 text-sm";

  return (
    <span className="inline-flex items-center gap-2">
      {/* Avatar */}
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full ${avatarSize}`}
        style={{ backgroundColor: avatar.bg }}
      >
        {avatar.emoji}
      </span>

      {/* Naam */}
      <span className="flex flex-wrap items-baseline gap-x-1">
        {profile.nickname ? (
          compact ? (
            <span className="font-semibold">
              {profile.nickname}{" "}
              <span className="font-normal text-[#9CA3AF]">- {initials(profile.display_name)}</span>
            </span>
          ) : (
            <>
              <span className="font-semibold">{profile.nickname}</span>
              {showRealName && (
                <span className="text-xs text-[#9CA3AF]">aka {profile.display_name}</span>
              )}
            </>
          )
        ) : (
          <span className="font-semibold">{profile.display_name}</span>
        )}
      </span>
    </span>
  );
}

export function AvatarCircle({
  profile,
  size = "md",
}: {
  profile: Profile;
  size?: "sm" | "md" | "lg";
}) {
  const avatar = getAvatar(profile.avatar_id);
  const sz = size === "sm" ? "h-6 w-6 text-xs" : size === "lg" ? "h-10 w-10 text-lg" : "h-8 w-8 text-sm";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${sz}`}
      style={{ backgroundColor: avatar.bg }}
    >
      {avatar.emoji}
    </span>
  );
}
