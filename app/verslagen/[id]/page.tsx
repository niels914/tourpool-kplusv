import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function VerslagDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, content, created_at, updated_at, author_id")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: author } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", post.author_id)
    .single();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/verslagen"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#9462A6] hover:underline"
      >
        ← Alle verslagen
      </Link>

      <article className="rounded-2xl border border-[#E2DFF0] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">{post.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-[#6B7280]">
          <span>{author?.display_name ?? "Redactie"}</span>
          <span>·</span>
          <span>
            {new Date(post.created_at).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="mt-6 whitespace-pre-wrap text-[#374151] leading-relaxed">
          {post.content}
        </div>
      </article>
    </div>
  );
}
