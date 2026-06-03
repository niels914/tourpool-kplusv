import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatClient } from "./ChatClient";

export const revalidate = 0;

export default async function ChatPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: messages } = await supabase
    .from("messages")
    .select("id, user_id, content, created_at, profiles(display_name)")
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Chat</h1>
        <p className="mt-1 text-[#6B7280]">Praat met de andere pooldeelnemers</p>
      </div>
      <ChatClient
        initialMessages={(messages ?? []) as Parameters<typeof ChatClient>[0]["initialMessages"]}
        currentUserId={user.id}
      />
    </div>
  );
}
