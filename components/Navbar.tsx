"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/klassement", label: "Klassement" },
  { href: "/etappes", label: "Etappes" },
  { href: "/renners", label: "Renners" },
  { href: "/verslagen", label: "Verslagen" },
  { href: "/chat", label: "Chat" },
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
    <nav
      className="border-b border-[#4A539A]"
      style={{
        background: "linear-gradient(135deg, #5760A6 0%, #4A539A 25%, #5760A6 50%, #6B5BA0 75%, #5760A6 100%)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo + title */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/kplusv-logo.jpg"
            alt="KplusV"
            width={32}
            height={32}
            className="rounded-md"
          />
          <div className="hidden sm:block">
            <span className="text-sm font-semibold text-white">KplusV</span>
            <span className="ml-1 text-sm font-semibold text-[#B8AED6]">Tourpool</span>
            <span className="ml-1 text-xs text-white/60">2026</span>
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
                    ? "bg-white text-[#5760A6]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
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
                    ? "bg-[#B8AED6] text-[#5760A6]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        )}

        {/* Rechts: ploeg samenstellen + uitloggen */}
        <div className="flex items-center gap-2">
          {loggedIn && (
            <button
              onClick={handleSignOut}
              className="rounded-lg px-3 py-1.5 text-sm text-white/60 hover:text-white"
            >
              Uitloggen
            </button>
          )}

          {/* Hamburger */}
          {loggedIn && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
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
        <div className="border-t border-white/20 px-4 py-2 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                pathname.startsWith(link.href)
                  ? "bg-white text-[#5760A6]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/registratie"
            onClick={() => setMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:text-white"
          >
            Ploeg samenstellen
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-[#B8AED6]"
            >
              Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
