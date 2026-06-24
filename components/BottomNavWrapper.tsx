import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "./BottomNav";

export async function BottomNavWrapper() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: lastStage } = await supabase
    .from("stages")
    .select("id")
    .eq("status", "locked")
    .order("stage_number", { ascending: false })
    .limit(1)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return <BottomNav lastLockedStageId={lastStage?.id ?? null} isAdmin={!!profile?.is_admin} />;
}
