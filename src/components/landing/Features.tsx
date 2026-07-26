"use client";

import { Cpu, ShieldCheck, Coins } from "lucide-react";

const features = [
  {
    icon: Cpu,
    stat: "500M+",
    title: "Verified profiles",
    description: "Enriched from public directories, company sites, and AI inference — not stale CSVs.",
  },
  {
    icon: ShieldCheck,
    stat: "97%",
    title: "Inbox delivery",
    description: "Rotating warm domains, human-paced sending, zero shared IP risk.",
  },
  {
    icon: Coins,
    stat: "$0.03",
    title: "Per email sent",
    description: "Pure pay-as-you-go. No seats, no tiers, no annual lock-in. Scale up or down instantly.",
  },
];

export function Features() {
  return (
    <section id="why" className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">
          Built different, <span className="gradient-text">priced fairly</span>
        </h2>
        <p className="text-center text-muted max-w-md mx-auto mb-16">
          The infrastructure you&apos;d need six months and a seed round to build.
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-8 rounded-2xl border border-border bg-card hover:bg-card-hover transition glow-card group"
            >
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/15 transition">
                <f.icon className="w-5 h-5 text-accent-light" />
              </div>
              <div className="text-4xl font-extrabold gradient-text mb-1">{f.stat}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
