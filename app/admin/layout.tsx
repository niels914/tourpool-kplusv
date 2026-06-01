import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const adminLinks = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/deelnemers", label: "Deelnemers" },
  { href: "/admin/renners", label: "Renners / startlijst" },
  { href: "/admin/etappes", label: "Etappes" },
  { href: "/admin/uitnodigingen", label: "Uitnodigingen" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/klassement");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="rounded-md bg-[#FFF3B0] px-2 py-0.5 text-xs font-semibold text-[#92400E]">
          Admin
        </span>
        <span className="text-[#6B7280]">KplusV Tourpool 2026</span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Zijbalk */}
        <nav className="w-full lg:w-48 shrink-0">
          <div className="flex gap-1 overflow-x-auto lg:flex-col">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Inhoud */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
