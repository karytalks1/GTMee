"use client";

import { useState, type FC } from "react";
import {
  Globe,
  Crosshair,
  UserSearch,
  PenLine,
  MessagesSquare,
  Gauge,
} from "lucide-react";

const cards = [
  {
    icon: Globe,
    tag: "Intelligence",
    title: "Reads your market like a strategist",
    copy: "Give it your URL. It reverse-engineers your positioning, maps competitors, and builds a profile your sales team would take weeks to assemble.",
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-accent-light">Analyzing site...</span>
        </div>
        <div className="p-3 rounded-lg bg-background/60 text-sm">
          <p className="font-medium text-foreground">acmehq.io</p>
          <p className="text-muted text-xs mt-1">
            Dev-tool for API monitoring — targets engineering leads at mid-size SaaS
          </p>
        </div>
        {["sentry.io", "datadog.com", "honeycomb.io"].map((c) => (
          <div key={c} className="flex items-center gap-2 pl-3 text-[11px] text-muted">
            <div className="w-1 h-1 rounded-full bg-muted/60" />
            {c}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Crosshair,
    tag: "Targeting",
    title: "Zeroes in on who actually buys",
    copy: "No guesswork. The AI clusters high-intent buyer personas and ranks them — so your first batch of outreach hits the right inboxes.",
    visual: (
      <div className="space-y-1.5">
        {[
          { name: "VP Engineering", score: 94 },
          { name: "Platform Leads", score: 89 },
          { name: "DevOps Managers", score: 83 },
          { name: "CTO / Co-founders", score: 78 },
        ].map((s) => (
          <div key={s.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background/60 text-sm">
            <span className="text-foreground/90">{s.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${s.score}%` }} />
              </div>
              <span className={`font-mono text-xs ${s.score >= 85 ? "text-accent-light" : "text-warning"}`}>
                {s.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: UserSearch,
    tag: "Prospecting",
    title: "Finds the humans behind the companies",
    copy: "Pulls verified names, titles, and emails from across the web — real people at companies that match your ideal profile.",
    visual: (
      <div className="space-y-2">
        {[
          { name: "Lin Zhao", role: "VP Eng", co: "Stripewave" },
          { name: "Derek Osei", role: "Platform Lead", co: "NovaPay" },
          { name: "Marta Fiore", role: "CTO", co: "Cloudlane" },
        ].map((l) => (
          <div key={l.name} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background/60">
            <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-[11px] font-bold text-secondary">
              {l.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{l.name}</p>
              <p className="text-[11px] text-muted truncate">{l.role} &middot; {l.co}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: PenLine,
    tag: "Writing",
    title: "Crafts emails that don't feel mass-sent",
    copy: "Each message opens with something specific to the recipient's company. No templates, no [FIRST_NAME] smell — just sharp, human copy.",
    visual: (
      <div className="p-3.5 rounded-lg bg-background/60 text-sm space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span className="font-medium">Subj:</span>
          <span className="text-foreground">Quick note on Stripewave&apos;s uptime page</span>
        </div>
        <div className="text-xs text-muted leading-relaxed">
          <p>Hey Lin,</p>
          <p className="mt-2">
            Noticed <span className="text-secondary">Stripewave publishes a public status page</span>{" "}
            — that tells me you care about reliability signals. We help teams
            like yours catch regressions before customers notice...
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: MessagesSquare,
    tag: "Replies",
    title: "Handles replies like a real SDR",
    copy: "Reads tone, answers objections, and when someone's interested — drops a calendar link and locks in the meeting.",
    visual: (
      <div className="space-y-2">
        {[
          { side: "in", text: "Looks interesting — what's the pricing?" },
          { side: "out", text: "Starts at $0 for the first 500 events/day. Want a 15-min walkthrough?" },
          { side: "in", text: "Sure, Thursday after 2pm." },
        ].map((m, i) => (
          <div key={i} className={`flex ${m.side === "out" ? "justify-end" : "justify-start"}`}>
            <div className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] ${
              m.side === "out" ? "bg-accent/15 text-accent-light" : "bg-background/60 text-foreground/90"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-[11px] font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
          Meeting booked &middot; Thu 14:30
        </div>
      </div>
    ),
  },
  {
    icon: Gauge,
    tag: "Optimization",
    title: "Learns what works, kills what doesn't",
    copy: "Tracks opens, replies, and conversions per segment. Automatically reallocates your budget toward the audiences that convert.",
    visual: (
      <div className="space-y-2">
        {[
          { name: "VP Engineering", status: "Scaling", cost: "$1.20", color: "text-accent-light", bar: 90 },
          { name: "Platform Leads", status: "Scaling", cost: "$1.55", color: "text-accent-light", bar: 80 },
          { name: "DevOps Mgrs", status: "Testing", cost: "$2.80", color: "text-warning", bar: 50 },
          { name: "Consultants", status: "Paused", cost: "$7.10", color: "text-danger", bar: 15 },
        ].map((r) => (
          <div key={r.name} className="px-3 py-2 rounded-lg bg-background/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-foreground/80">{r.name}</span>
              <span className={r.color}>{r.status}</span>
            </div>
            <div className="w-full h-1 rounded-full bg-border overflow-hidden">
              <div className={`h-full rounded-full ${r.bar > 60 ? "bg-accent" : r.bar > 30 ? "bg-warning" : "bg-danger"}`} style={{ width: `${r.bar}%` }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export function Pipeline() {
  const [active, setActive] = useState(0);

  return (
    <section id="how" className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">
          One URL in. <span className="gradient-text">Meetings out.</span>
        </h2>
        <p className="text-center text-muted max-w-lg mx-auto mb-16">
          Six capabilities, zero manual work.
        </p>

        {/* Tab selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {cards.map((card, i) => (
            <button
              key={card.tag}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active === i
                  ? "bg-secondary text-white shadow-[0_4px_16px_rgba(189,68,68,0.25)]"
                  : "bg-card border border-border text-muted hover:text-foreground hover:border-border/80"
              }`}
            >
              <card.icon className="w-4 h-4" />
              {card.tag}
            </button>
          ))}
        </div>

        {/* Active card */}
        {(() => {
          const ActiveIcon = cards[active].icon;
          return (
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold tracking-wide">
                  <ActiveIcon className="w-3.5 h-3.5" />
                  {cards[active].tag}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{cards[active].title}</h3>
                <p className="text-muted leading-relaxed text-base">{cards[active].copy}</p>
              </div>
              <div className="p-6 rounded-2xl border border-border bg-card glow-card">
                {cards[active].visual}
              </div>
            </div>
          );
        })()}

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-10">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                active === i ? "bg-secondary w-6" : "bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
