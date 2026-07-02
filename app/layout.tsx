import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BottomNavWrapper } from "@/components/BottomNavWrapper";

export const metadata: Metadata = {
  title: "KplusV Tourpool 2026",
  description: "De interne Tour de France-pool van KplusV",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="kpv-stripe" />
        <Navbar />
        <main className="min-h-screen overflow-x-hidden pb-20 md:pb-0">{children}</main>
        <BottomNavWrapper />
      </body>
    </html>
  );
}
