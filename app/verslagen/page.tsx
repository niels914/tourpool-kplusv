import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 60;

export default async function VerslagenPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
    : { data: null };
  const isAdmin = profile?.is_admin ?? false;

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, created_at, author_id")
    .order("created_at", { ascending: false });

  // Haal auteursnamen op
  const authorIds = [...new Set(posts?.map((p) => p.author_id) ?? [])];
  const { data: profiles } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", authorIds)
    : { data: [] };

  const nameMap: Record<string, string> = {};
  for (const p of profiles ?? []) nameMap[p.id] = p.display_name;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Verslagen</h1>
          <p className="mt-1 text-[#6B7280]">Wedstrijdverslagen en updates van de redactie</p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/verslagen"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#9462A6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5760A6] transition"
          >
            + Nieuw verslag
          </Link>
        )}
      </div>

      {!posts || posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E2DFF0] bg-white p-12 text-center">
          <div className="mb-3 text-4xl">📝</div>
          <p className="font-medium text-[#111827]">Nog geen verslagen</p>
          <p className="mt-1 text-sm text-[#6B7280]">
            De eerste verslagen verschijnen zodra de Tour begint.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/verslagen/${post.id}`}
              className="block rounded-2xl border border-[#E2DFF0] bg-white p-6 shadow-sm transition hover:border-[#B8AED6] hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-[#111827]">{post.title}</h2>
              <div className="mt-2 flex items-center gap-3 text-sm text-[#6B7280]">
                <span>{nameMap[post.author_id] ?? "Redactie"}</span>
                <span>·</span>
                <span>
                  {new Date(post.created_at).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
