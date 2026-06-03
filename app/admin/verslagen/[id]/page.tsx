import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { VerslagForm } from "../VerslagForm";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminVerslagEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, content")
    .eq("id", id)
    .single();

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/admin/verslagen"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#9462A6] hover:underline"
      >
        ← Terug naar verslagen
      </Link>
      <div className="rounded-2xl border border-[#E2DFF0] bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">Verslag bewerken</h1>
        <VerslagForm post={post} />
      </div>
    </div>
  );
}
