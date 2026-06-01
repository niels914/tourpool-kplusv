import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

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
      <body>
        <div className="tdf-stripe" />
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
