"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: { display_name: string } | null;
};

export function ChatClient({
  initialMessages,
  currentUserId,
}: {
  initialMessages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const newMsg = payload.new as Omit<Message, "profiles">;
          // Haal displaynaam op
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", newMsg.user_id)
            .single();
          setMessages((prev) => [
            ...prev,
            { ...newMsg, profiles: profile ?? null },
          ]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSending(false); return; }

    // Optimistisch toevoegen
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      user_id: user.id,
      content: input.trim(),
      created_at: new Date().toISOString(),
      profiles: null, // wordt ingevuld via realtime
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    await supabase.from("messages").insert({
      user_id: user.id,
      content: input.trim(),
    });

    setSending(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("messages").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>
      {/* Berichten */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-[#E2DFF0] bg-white p-4 shadow-sm">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="mb-2 text-3xl">💬</div>
              <p className="text-sm text-[#6B7280]">Nog geen berichten. Wees de eerste!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwn = msg.user_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    {!isOwn && (
                      <span className="ml-1 text-xs font-medium text-[#5760A6]">
                        {msg.profiles?.display_name ?? "…"}
                      </span>
                    )}
                    <div
                      className={`group relative rounded-2xl px-4 py-2.5 text-sm ${
                        isOwn
                          ? "rounded-br-sm bg-[#9462A6] text-white"
                          : "rounded-bl-sm bg-[#F3F1FA] text-[#111827]"
                      }`}
                    >
                      {msg.content}
                      {isOwn && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="absolute -left-6 top-1/2 -translate-y-1/2 hidden text-xs text-[#9CA3AF] hover:text-red-500 group-hover:block"
                          title="Verwijderen"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <span className="px-1 text-xs text-[#9CA3AF]">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Invoer */}
      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Schrijf een bericht…"
          maxLength={500}
          className="flex-1 rounded-xl border border-[#E2DFF0] px-4 py-2.5 text-sm outline-none focus:border-[#9462A6] focus:ring-2 focus:ring-[#EDE8F5]"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl bg-[#9462A6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5760A6] disabled:opacity-50"
        >
          Stuur
        </button>
      </form>
      <p className="mt-1 text-right text-xs text-[#9CA3AF]">{input.length}/500</p>
    </div>
  );
}
