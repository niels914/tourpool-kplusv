import { createClient } from "@/lib/supabase/server";
import { BlockButton } from "./BlockButton";
import { DeleteButton } from "./DeleteButton";

export default async function AdminDeelnemersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, email, is_admin, is_blocked, created_at")
    .order("created_at", { ascending: true });

  // Aantal picks per user
  const { data: pickCounts } = await supabase
    .from("team_picks")
    .select("user_id, bib_slot");

  const pickCountByUser: Record<string, number> = {};
  (pickCounts as Array<{ user_id: string; bib_slot: number }> | null)?.forEach((p) => {
    pickCountByUser[p.user_id] = (pickCountByUser[p.user_id] ?? 0) + 1;
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[#111827]">Deelnemers</h1>

      <div className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2DFF0] bg-[#F3F1FA]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Naam</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">E-mail</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Ploeg</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Rol</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile) => {
              const picks = pickCountByUser[profile.id] ?? 0;
              return (
                <tr key={profile.id} className={`border-b border-[#F3F4F6] ${profile.is_blocked ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-[#111827]">{profile.display_name}</td>
                  <td className="hidden px-4 py-3 text-[#6B7280] sm:table-cell">{profile.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${picks === 8 ? "bg-[#EDE8F5] text-[#5760A6]" : picks > 0 ? "bg-[#F3F1FA] text-[#9462A6]" : "bg-gray-100 text-gray-500"}`}>
                      {picks}/8
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {profile.is_admin && (
                      <span className="rounded-full bg-[#EDE8F5] px-2 py-0.5 text-xs font-medium text-[#5760A6]">Admin</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${profile.is_blocked ? "bg-red-100 text-red-700" : "bg-[#EDE8F5] text-[#5760A6]"}`}>
                      {profile.is_blocked ? "Geblokkeerd" : "Actief"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <BlockButton profileId={profile.id} isBlocked={profile.is_blocked} />
                      <DeleteButton profileId={profile.id} displayName={profile.display_name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
