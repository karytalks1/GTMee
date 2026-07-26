import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "gtmee — Outbound on Autopilot",
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
    <html lang="en" className={`${dmSans.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a0f] text-white font-[family-name:var(--font-dm-sans)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
