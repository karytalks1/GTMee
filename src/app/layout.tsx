import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "GTMee — Outbound on Autopilot",
  description:
    "Drop your website URL and let AI agents research your market, find decision-makers, write personal emails, and book meetings — all on autopilot.",
  keywords:
    "AI outreach, sales automation, lead generation, cold email, B2B prospecting, outbound",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground font-[family-name:var(--font-outfit)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
