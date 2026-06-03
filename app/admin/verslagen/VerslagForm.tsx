"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  title: string;
  content: string;
};

export function VerslagForm({ post }: { post?: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Niet ingelogd."); setLoading(false); return; }

    if (post) {
      // Bewerken
      const { error } = await supabase
        .from("posts")
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq("id", post.id);
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      // Nieuw
      const { error } = await supabase
        .from("posts")
        .insert({ title, content, author_id: user.id });
      if (error) { setError(error.message); setLoading(false); return; }
    }

    router.push("/admin/verslagen");
    router.refresh();
  }

  async function handleDelete() {
    if (!post) return;
    if (!confirm("Verslag verwijderen?")) return;
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", post.id);
    router.push("/admin/verslagen");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#374151]">Titel</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="bijv. Etappe 1 — Een historische start"
          className="w-full rounded-lg border border-[#E2DFF0] px-4 py-2.5 text-sm outline-none focus:border-[#9462A6] focus:ring-2 focus:ring-[#EDE8F5]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#374151]">Inhoud</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={12}
          placeholder="Schrijf hier het verslag..."
          className="w-full rounded-lg border border-[#E2DFF0] px-4 py-2.5 text-sm outline-none focus:border-[#9462A6] focus:ring-2 focus:ring-[#EDE8F5]"
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !title || !content}
          className="rounded-lg bg-[#9462A6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5760A6] disabled:opacity-50"
        >
          {loading ? "Opslaan…" : post ? "Wijzigingen opslaan" : "Verslag plaatsen"}
        </button>
        {post && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Verwijderen
          </button>
        )}
      </div>
    </form>
  );
}
