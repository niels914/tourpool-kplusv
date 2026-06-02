"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function BlockButton({ profileId, isBlocked }: { profileId: string; isBlocked: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any)
      .update({ is_blocked: !isBlocked })
      .eq("id", profileId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
        isBlocked
          ? "bg-[#EDE8F5] text-[#5760A6] hover:bg-[#D1FAE5]"
          : "bg-red-50 text-red-600 hover:bg-red-100"
      }`}
    >
      {loading ? "…" : isBlocked ? "Activeren" : "Blokkeren"}
    </button>
  );
}
