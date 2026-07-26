"use client";

const testimonials = [
  {
    quote: "Set it up on Monday, had three demo calls booked by Wednesday. No DNS fiddling, no warmup — just results.",
    name: "Arjun M.",
    company: "StackLayer",
  },
  {
    quote: "We replaced two SDRs and an Apollo subscription. The per-lead cost dropped from $28 to under $3.",
    name: "Clara T.",
    company: "Beacon Analytics",
  },
  {
    quote: "The emails don't read like AI wrote them. A prospect actually complimented our outreach — that's a first.",
    name: "David K.",
    company: "Rivercross Capital",
  },
  {
    quote: "Ran a test against our in-house sequences. Prospex pulled a 4.2% reply rate vs our 0.9%. Not even close.",
    name: "Nkechi O.",
    company: "GreenGrid Energy",
  },
  {
    quote: "I'm a solo founder. This thing basically gave me a sales team for the price of a coffee subscription.",
    name: "Sam L.",
    company: "Dovetail Studio",
  },
  {
    quote: "Paused underperforming segments automatically and reallocated spend. Smarter than most humans I've managed.",
    name: "Riya P.",
    company: "Halo Logistics",
  },
];

export function Testimonials() {
  return (
    <section className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">
          Don&apos;t take our word <span className="gradient-text">for it</span>
        </h2>
        <p className="text-center text-muted max-w-md mx-auto mb-16">
          From solo founders to growth teams.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-2xl border border-border bg-card hover:bg-card-hover transition glow-card"
            >
              <p className="text-sm text-muted mb-6 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-[11px] font-bold text-accent-light">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[11px] text-muted">{t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
