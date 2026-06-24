import { createClient } from "@/lib/supabase/server";
import { UitnodigingForm } from "./UitnodigingForm";
import { CopyButton } from "./CopyButton";

export default async function AdminUitnodigingenPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*, used_by_profile:profiles!invitations_used_by_fkey(display_name)")
    .order("created_at", { ascending: false });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tourpool-kplusv.netlify.app";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[#111827]">Uitnodigingen</h1>

      <div className="mb-8">
        <UitnodigingForm userId={user!.id} />
      </div>

      <h2 className="mb-3 font-semibold text-[#111827]">Verzonden uitnodigingen</h2>

      {!invitations?.length ? (
        <p className="text-sm text-[#6B7280]">Nog geen uitnodigingen aangemaakt.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2DFF0] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2DFF0] bg-[#F3F1FA]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">E-mail</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Link</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] sm:table-cell">Aangemaakt</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => {
                const inviteUrl = `${baseUrl}/join?token=${inv.token}`;
                return (
                  <tr key={inv.id} className="border-b border-[#F3F4F6]">
                    <td className="px-4 py-3 text-[#374151]">{inv.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      {inv.used_at ? (
                        <span className="text-[#6B7280]">Gebruikt</span>
                      ) : (
                        <CopyButton text={inviteUrl} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {inv.used_at ? (
                        <span className="rounded-full bg-[#EDE8F5] px-2 py-0.5 text-xs font-medium text-[#5760A6]">
                          Gebruikt
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#EDE8F5] px-2 py-0.5 text-xs font-medium text-[#5760A6]">
                          Wacht
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-[#6B7280] sm:table-cell">
                      {new Date(inv.created_at).toLocaleDateString("nl-NL")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
