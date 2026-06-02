import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// /mijn-team stuurt door naar de eigen deelnemerspagina
export default async function MijnTeamPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  redirect(`/deelnemers/${user.id}`);
}
