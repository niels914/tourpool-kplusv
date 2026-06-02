import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RegistratieForm } from "./RegistratieForm";

export default async function RegistratiePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Deadline check
  const { data: config } = await supabase
    .from("config")
    .select("value")
    .eq("key", "registration_deadline")
    .single();

  const deadline = config ? new Date(config.value) : null;
  const isOpen = deadline ? new Date() < deadline : true;

  // Huidige picks
  const { data: picks } = await supabase
    .from("team_picks")
    .select("bib_slot, rider_id, riders(id, full_name, team_name, bib_number, nationality)")
    .eq("user_id", user.id)
    .order("bib_slot", { ascending: true });

  // Alle renners (gegroepeerd op eindcijfer)
  const { data: riders } = await supabase
    .from("riders")
    .select("id, full_name, team_name, bib_number, nationality, bib_digit, is_dns, is_dnf")
    .eq("is_dns", false)
    .order("bib_number", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Stel jouw ploeg samen</h1>
        <p className="mt-1 text-[#6B7280]">
          Kies één renner per rugnummerslot (eindcijfer 1 t/m 8)
        </p>
      </div>

      {!isOpen ? (
        <RegistratieGesloten picks={picks} />
      ) : (
        <>
          <DeadlineBanner deadline={deadline} />
          <RegistratieForm
            riders={riders ?? []}
            currentPicks={picks ?? []}
            userId={user.id}
          />
        </>
      )}
    </div>
  );
}

function DeadlineBanner({ deadline }: { deadline: Date | null }) {
  if (!deadline) return null;
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl bg-[#EDE8F5] px-4 py-3 text-sm">
      <span className="text-lg">⏰</span>
      <span>
        <strong>Deadline:</strong>{" "}
        {deadline.toLocaleDateString("nl-NL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        om{" "}
        {deadline.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}

function RegistratieGesloten({ picks }: { picks: unknown[] | null }) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        <span className="text-lg">🔒</span>
        <span>
          <strong>Registratie gesloten.</strong> De deadline is verstreken — je keuzes staan vast.
        </span>
      </div>
      {picks && picks.length > 0 ? (
        <div className="rounded-2xl border border-[#E2DFF0] bg-white p-6">
          <p className="mb-4 font-semibold text-[#111827]">Jouw ploeg:</p>
          <div className="space-y-2">
            {picks.map((pick: unknown) => {
              const p = pick as { bib_slot: number; riders: { full_name: string; bib_number: number; team_name: string } | null };
              return (
                <div key={p.bib_slot} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5760A6] text-xs font-bold text-white">
                    …{p.bib_slot}
                  </span>
                  <span className="font-medium text-[#111827]">{p.riders?.full_name}</span>
                  <span className="text-sm text-[#6B7280]">#{p.riders?.bib_number} · {p.riders?.team_name}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-[#6B7280]">Je hebt geen ploeg ingevuld voor de deadline.</p>
      )}
    </div>
  );
}
