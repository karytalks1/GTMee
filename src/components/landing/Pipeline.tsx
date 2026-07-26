"use client";

import {
  Globe,
  Crosshair,
  UserSearch,
  PenLine,
  MessagesSquare,
  Gauge,
} from "lucide-react";

const steps = [
  {
    icon: Globe,
    title: "Understands your business",
    copy: "Paste a URL. The agent crawls your site, maps your offer, and benchmarks you against similar players in seconds.",
    demo: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-accent-light">Reading site...</span>
        </div>
        <div className="p-3 rounded-lg bg-background/60 text-sm">
          <p className="font-medium text-foreground">acmehq.io</p>
          <p className="text-muted text-xs mt-1">
            Dev-tool for API monitoring &mdash; targets engineering leads at
            mid-size SaaS companies
          </p>
        </div>
        <p className="text-[11px] text-accent-light font-medium">
          Mapping competitors...
        </p>
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
    title: "Profiles the ideal buyer",
    copy: "AI clusters your best-fit segments and ranks each by purchase intent so you never waste a send.",
    demo: (
      <div className="space-y-1.5">
        <div className="grid grid-cols-2 text-[11px] font-medium text-muted px-2 mb-1">
          <span>Segment</span><span className="text-right">Match</span>
        </div>
        {[
          { name: "VP Engineering", score: 94 },
          { name: "Platform Leads", score: 89 },
          { name: "DevOps Managers", score: 83 },
          { name: "CTO / Co-founders", score: 78 },
        ].map((s) => (
          <div key={s.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background/60 text-sm">
            <span className="text-foreground/90">{s.name}</span>
            <span className={`font-mono text-xs ${s.score >= 85 ? "text-accent-light" : s.score >= 75 ? "text-warning" : "text-muted"}`}>
              {s.score}%
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: UserSearch,
    title: "Hunts down real contacts",
    copy: "Cross-references public directories, enrichment APIs, and web data to surface verified names and emails.",
    demo: (
      <div className="space-y-2">
        {[
          { name: "Lin Zhao", role: "VP Eng", co: "Stripewave", email: "lin@stripewave.io" },
          { name: "Derek Osei", role: "Platform Lead", co: "NovaPay", email: "derek@novapay.com" },
          { name: "Marta Fiore", role: "CTO", co: "Cloudlane", email: "marta@cloudlane.dev" },
        ].map((l) => (
          <div key={l.name} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background/60">
            <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-[11px] font-bold text-accent-light">
              {l.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{l.name}</p>
              <p className="text-[11px] text-muted truncate">{l.role} &middot; {l.co}</p>
            </div>
            <span className="text-[11px] text-muted hidden sm:block">{l.email}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: PenLine,
    title: "Drafts emails that feel handwritten",
    copy: "Every message opens with something specific to the recipient — no templates, no merge-tag smell.",
    demo: (
      <div className="p-3.5 rounded-lg bg-background/60 text-sm space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span className="font-medium">Subject:</span>
          <span className="text-foreground">Quick note on Stripewave&apos;s uptime page</span>
        </div>
        <div className="text-xs text-muted leading-relaxed">
          <p>Hey Lin,</p>
          <p className="mt-2">
            Noticed <span className="text-accent-light">Stripewave publishes a public status page</span>{" "}
            — that tells me you care about reliability signals. We help teams
            like yours catch regressions before your customers tweet about
            them...
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: MessagesSquare,
    title: "Conversations on autopilot",
    copy: "Reads tone, answers questions, handles pushback, and locks in a calendar slot when interest peaks.",
    demo: (
      <div className="space-y-2">
        {[
          { side: "in", text: "Looks interesting — what's the pricing?" },
          { side: "out", text: "Starts at $0 for the first 500 events/day. Happy to walk you through the dashboard live — 15 min?" },
          { side: "in", text: "Sure, Thursday after 2pm works." },
          { side: "out", text: "Locked in — Thu 2:30 PM. Calendar invite on its way." },
        ].map((m, i) => (
          <div key={i} className={`flex ${m.side === "out" ? "justify-end" : "justify-start"}`}>
            <div className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] ${
              m.side === "out" ? "bg-accent/15 text-accent-light" : "bg-background/60 text-foreground/90"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-[11px] font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          Meeting confirmed &middot; Thu 14:30
        </div>
      </div>
    ),
  },
  {
    icon: Gauge,
    title: "Optimises while you sleep",
    copy: "Measures reply quality per segment, kills what's flat, and doubles spend where conversations convert.",
    demo: (
      <div className="space-y-2">
        {[
          { name: "VP Engineering", status: "Scaling", cost: "$1.20", color: "text-accent-light" },
          { name: "Platform Leads", status: "Scaling", cost: "$1.55", color: "text-accent-light" },
          { name: "DevOps Mgrs", status: "Testing", cost: "$2.80", color: "text-warning" },
          { name: "Consultants", status: "Stopped", cost: "$7.10", color: "text-danger" },
        ].map((r) => (
          <div key={r.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background/60 text-sm">
            <span className="text-foreground/80 text-xs">{r.name}</span>
            <div className="flex items-center gap-4">
              <span className={`text-[11px] ${r.color}`}>{r.status}</span>
              <span className="text-[11px] font-mono text-muted">{r.cost}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export function Pipeline() {
  return (
    <section id="how" className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">
          One URL in. <span className="gradient-text">Meetings out.</span>
        </h2>
        <p className="text-center text-muted max-w-lg mx-auto mb-16">
          Six steps, fully automated, running 24/7.
        </p>

        <div className="space-y-16">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-10 items-center`}
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-accent-light" />
                  </div>
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-widest">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.copy}</p>
              </div>
              <div className="flex-1 w-full max-w-md">
                <div className="p-5 rounded-2xl border border-border bg-card glow-card">
                  {step.demo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
