import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: participantCount },
    { count: riderCount },
    { data: stages },
    { data: config },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_blocked", false),
    supabase.from("riders").select("*", { count: "exact", head: true }),
    supabase.from("stages").select("stage_number, status").order("stage_number"),
    supabase.from("config").select("key, value"),
  ]);

  const deadline = config?.find((c) => c.key === "registration_deadline")?.value;
  const deadlineDate = deadline ? new Date(deadline) : null;
  const registrationOpen = deadlineDate ? new Date() < deadlineDate : true;

  const pendingStages = stages?.filter((s) => s.status === "results_pending") ?? [];
  const lockedStages = stages?.filter((s) => s.status === "locked") ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Deelnemers" value={participantCount ?? 0} />
        <StatCard label="Renners" value={riderCount ?? 0} />
        <StatCard label="Etappes afgerond" value={lockedStages.length} />
        <StatCard label="Wacht op controle" value={pendingStages.length} highlight={pendingStages.length > 0} />
      </div>

      {/* Status */}
      <div className="mb-8 rounded-xl border border-[#E2DFF0] bg-white p-5">
        <h2 className="mb-3 font-semibold text-[#111827]">Status</h2>
        <div className="space-y-2 text-sm">
          <StatusRow
            label="Registratie"
            value={registrationOpen ? "Open" : "Gesloten"}
            ok={!registrationOpen}
          />
          <StatusRow
            label="Deadline"
            value={
              deadlineDate
                ? deadlineDate.toLocaleString("nl-NL", { dateStyle: "full", timeStyle: "short" })
                : "Niet ingesteld"
            }
            ok={!!deadlineDate}
          />
          <StatusRow
            label="Startlijst"
            value={riderCount ? `${riderCount} renners geladen` : "Nog niet geladen"}
            ok={!!riderCount && riderCount > 100}
          />
        </div>
      </div>

      {/* Acties */}
      {pendingStages.length > 0 && (
        <div className="mb-6 rounded-xl border border-[#FFD700] bg-[#EDE8F5] p-5">
          <h2 className="mb-2 font-semibold text-[#5760A6]">
            Actie vereist — {pendingStages.length} etappe{pendingStages.length > 1 ? "s" : ""} wacht op vergrendeling
          </h2>
          <div className="flex flex-wrap gap-2">
            {pendingStages.map((s) => (
              <Link
                key={s.stage_number}
                href={`/admin/etappes?stage=${s.stage_number}`}
                className="rounded-lg bg-[#5760A6] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#78350F]"
              >
                Etappe {s.stage_number} bekijken →
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Snelkoppelingen */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/admin/renners", label: "Startlijst beheren" },
          { href: "/admin/etappes", label: "Etappes beheren" },
          { href: "/admin/deelnemers", label: "Deelnemers" },
          { href: "/admin/uitnodigingen", label: "Uitnodigingen" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-[#E2DFF0] bg-white p-4 text-sm font-medium text-[#374151] hover:border-[#9462A6] hover:text-[#5760A6] transition"
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-[#FFD700] bg-[#EDE8F5]" : "border-[#E2DFF0] bg-white"}`}>
      <div className="text-2xl font-bold text-[#111827]">{value}</div>
      <div className="text-xs text-[#6B7280]">{label}</div>
    </div>
  );
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#374151]">{label}</span>
      <span className={`flex items-center gap-1.5 ${ok ? "text-[#5760A6]" : "text-[#5760A6]"}`}>
        <span>{ok ? "✓" : "⚠"}</span>
        <span>{value}</span>
      </span>
    </div>
  );
}
