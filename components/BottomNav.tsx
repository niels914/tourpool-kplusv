"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  lastLockedStageId: string | null;
};

export function BottomNav({ lastLockedStageId }: Props) {
  const pathname = usePathname();

  const etappeHref = lastLockedStageId ? `/etappes/${lastLockedStageId}` : "/etappes";
  const isEtappe = pathname.startsWith("/etappes");
  const isKlassement = pathname.startsWith("/klassement");
  const isDashboard = pathname === "/";
  const isMijnTeam = pathname.startsWith("/mijn-team");
  const isChat = pathname.startsWith("/chat");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2DFF0] bg-white/95 backdrop-blur-sm md:hidden">
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 py-2">

        {/* Etappe */}
        <Link href={etappeHref} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${isEtappe ? "text-[#9462A6]" : "text-[#9CA3AF] hover:text-[#5760A6]"}`}>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            {/* Vlaggenstok */}
            <rect x="3.5" y="2" width="1.5" height="20" rx="0.75" />
            {/* Geblokt patroon rij 1 */}
            <rect x="5" y="2" width="4.5" height="4.5" />
            <rect x="14" y="2" width="4.5" height="4.5" />
            {/* Geblokt patroon rij 2 */}
            <rect x="9.5" y="6.5" width="4.5" height="4.5" />
            <rect x="18.5" y="6.5" width="4.5" height="4.5" />
            {/* Geblokt patroon rij 3 */}
            <rect x="5" y="11" width="4.5" height="4.5" />
            <rect x="14" y="11" width="4.5" height="4.5" />
          </svg>
          <span className="text-[10px] font-medium">Etappe</span>
        </Link>

        {/* Klassement */}
        <Link href="/klassement" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${isKlassement ? "text-[#9462A6]" : "text-[#9CA3AF] hover:text-[#5760A6]"}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[10px] font-medium">Klassement</span>
        </Link>

        {/* Dashboard — midden, groter */}
        <Link href="/" className={`flex flex-col items-center gap-0.5 -mt-3 px-4 py-2 rounded-2xl shadow-lg transition ${isDashboard ? "bg-[#9462A6] text-white" : "bg-[#5760A6] text-white hover:bg-[#9462A6]"}`}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-semibold">Dashboard</span>
        </Link>

        {/* Mijn ploeg */}
        <Link href="/mijn-team" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${isMijnTeam ? "text-[#9462A6]" : "text-[#9CA3AF] hover:text-[#5760A6]"}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Mijn ploeg</span>
        </Link>

        {/* Chat */}
        <Link href="/chat" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${isChat ? "text-[#9462A6]" : "text-[#9CA3AF] hover:text-[#5760A6]"}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[10px] font-medium">Chat</span>
        </Link>

      </div>
      {/* Safe area voor telefoons met home indicator */}
      <div className="h-safe-bottom bg-white/95" />
    </nav>
  );
}
