import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { VerslagForm } from "./VerslagForm";

export const revalidate = 0;

export default async function AdminVerslagenPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, created_at, updated_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Verslagen beheren</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Schrijf en bewerk wedstrijdverslagen.</p>
      </div>

      {/* Nieuw verslag */}
      <div className="mb-10 rounded-2xl border border-[#E2DFF0] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#111827]">Nieuw verslag</h2>
        <VerslagForm />
      </div>

      {/* Bestaande verslagen */}
      {posts && posts.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[#111827]">Gepubliceerde verslagen</h2>
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-xl border border-[#E2DFF0] bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="font-medium text-[#111827]">{post.title}</p>
                  <p className="text-xs text-[#6B7280]">
                    {new Date(post.created_at).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Link
                  href={`/admin/verslagen/${post.id}`}
                  className="rounded-lg bg-[#EDE8F5] px-3 py-1.5 text-xs font-medium text-[#5760A6] hover:bg-[#B8AED6]"
                >
                  Bewerken
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
