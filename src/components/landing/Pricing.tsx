"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  const [emails, setEmails] = useState(1000);

  const cost = Math.round(emails * 0.03);
  const leadsLow = Math.max(1, Math.round(emails * 0.002));
  const leadsHigh = Math.max(2, Math.round(emails * 0.008));
  const meetingsLow = Math.max(1, Math.round(leadsLow * 0.25));
  const meetingsHigh = Math.max(1, Math.round(leadsHigh * 0.3));

  return (
    <section id="pricing" className="py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">
          Transparent, <span className="gradient-text">usage-based</span>
        </h2>
        <p className="text-center text-muted mb-14">
          Slide to estimate. Pay only for what you send.
        </p>

        <div className="p-8 rounded-2xl border border-border bg-card">
          <div className="text-center mb-6">
            <span className="text-5xl font-extrabold gradient-text">${cost}</span>
            <span className="text-muted ml-2 text-sm">estimated</span>
          </div>

          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={emails}
            onChange={(e) => setEmails(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-border accent-accent mb-8"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { value: emails.toLocaleString(), label: "Emails" },
              { value: `~${leadsLow}–${leadsHigh}`, label: "Warm leads" },
              { value: `~${meetingsLow}–${meetingsHigh}`, label: "Meetings" },
              {
                value: leadsHigh > 0 ? `$${(cost / leadsHigh).toFixed(0)}–$${leadsLow > 0 ? (cost / leadsLow).toFixed(0) : "0"}` : "$0",
                label: "Per lead",
              },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-background/60">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[11px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 mb-8">
            {[
              "AI-driven website analysis and buyer profiling",
              "Unique emails per recipient — zero templates",
              "Automated reply handling and calendar booking",
              "Real-time campaign analytics",
              "Enriched contact database access",
              "No monthly fees or contracts",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-muted">{item}</span>
              </div>
            ))}
          </div>

          <Link
            href="/signup"
            className="block w-full py-3.5 bg-secondary hover:bg-secondary/85 text-white rounded-xl font-semibold text-center text-sm transition"
          >
            Start with free credits
          </Link>
        </div>
      </div>
    </section>
  );
}
