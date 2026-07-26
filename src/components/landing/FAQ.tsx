"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How fast can I get started?",
    a: "Under a minute. Paste your domain, review the ICP the agent suggests, and hit go. There's no DNS setup, no domain warming, and no onboarding call.",
  },
  {
    q: "What does it actually cost?",
    a: "Every new account gets free starter credits. After that it's $0.03 per email — pure usage billing. No subscriptions, no seat fees, no surprise invoices.",
  },
  {
    q: "Will this hurt my domain reputation?",
    a: "No. All emails go through our own pre-warmed sending infrastructure. Your domain is never exposed, so your deliverability stays exactly where it is today.",
  },
  {
    q: "How do you avoid the spam folder?",
    a: "Rotating warm domains, staggered send times, per-recipient personalisation (no two emails are identical), and built-in bounce monitoring. Inbox rates sit above 95%.",
  },
  {
    q: "Can I review emails before they go out?",
    a: "Yes. You can preview, edit, or veto any draft. You can also set guardrails — tone, topics to avoid, max follow-ups — and let the agent handle the rest.",
  },
  {
    q: "What happens when someone replies?",
    a: "The agent reads the reply, classifies intent, and responds appropriately. If the prospect is ready to talk, it proposes time slots and sends a calendar invite automatically.",
  },
  {
    q: "Can I upload my own contact list?",
    a: "Absolutely. Drop a CSV and the agent will enrich each row with web research, then write tailored emails — same workflow, your data.",
  },
  {
    q: "Is cold outreach legal?",
    a: "Yes, when done right. B2B cold email is permitted under CAN-SPAM, GDPR legitimate interest, and equivalent laws — provided emails are honest, relevant, and include an easy opt-out. We handle compliance defaults for you.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-14 tracking-tight">
          Questions <span className="gradient-text">&amp; answers</span>
        </h2>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left text-sm hover:bg-card-hover transition"
              >
                <span className="font-medium pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-muted leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
