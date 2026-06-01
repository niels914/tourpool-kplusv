"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/klassement", label: "Klassement" },
  { href: "/etappes", label: "Etappes" },
  { href: "/mijn-team", label: "Mijn ploeg" },
  { href: "/spelregels", label: "Spelregels" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });
    supabase
      .from("profiles")
      .select("is_admin")
      .single()
      .then(({ data }) => {
        if (data?.is_admin) setIsAdmin(true);
      });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <nav className="border-b border-[#E5E5E0] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1A1A1A]">
            <span className="text-sm">🚴</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold text-[#1A1A1A]">
              KplusV
            </span>
            <span className="ml-1 text-sm font-bold text-[#FFD700]" style={{ WebkitTextStroke: "0.5px #1A1A1A" }}>
              Tourpool
            </span>
            <span className="ml-1 text-xs text-[#6B7280]">2026</span>
          </div>
        </Link>

        {/* Desktop nav */}
        {loggedIn && (
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  pathname.startsWith(link.href)
                    ? "bg-[#E8F7EE] text-[#006B35]"
                    : "text-[#374151] hover:bg-[#F3F4F6]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  pathname.startsWith("/admin")
                    ? "bg-[#FFF3B0] text-[#92400E]"
                    : "text-[#374151] hover:bg-[#F3F4F6]"
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        )}

        {/* Rechts: registratie-link + uitloggen */}
        <div className="flex items-center gap-2">
          {loggedIn && (
            <>
              <Link
                href="/registratie"
                className={`hidden rounded-lg border px-3 py-1.5 text-sm font-medium transition sm:block ${
                  pathname === "/registratie"
                    ? "border-[#00A651] bg-[#E8F7EE] text-[#006B35]"
                    : "border-[#E5E5E0] text-[#374151] hover:border-[#00A651]"
                }`}
              >
                Mijn ploeg samenstellen
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-lg px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#111827]"
              >
                Uitloggen
              </button>
            </>
          )}

          {/* Hamburger */}
          {loggedIn && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 text-[#374151] hover:bg-[#F3F4F6] md:hidden"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobiel menu */}
      {menuOpen && loggedIn && (
        <div className="border-t border-[#E5E5E0] px-4 py-2 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                pathname.startsWith(link.href)
                  ? "bg-[#E8F7EE] text-[#006B35]"
                  : "text-[#374151]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/registratie"
            onClick={() => setMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-[#374151]"
          >
            Ploeg samenstellen
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-[#92400E]"
            >
              Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
