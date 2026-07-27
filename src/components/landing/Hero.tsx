"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const words = ["prospect", "research", "write", "send", "close"];

export function Hero() {
  const [website, setWebsite] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const handleLaunch = () => {
    router.push(
      website.trim()
        ? `/signup?website=${encodeURIComponent(website.trim())}`
        : "/signup"
    );
  };

  return (
    <section className="relative pt-36 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-secondary/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-accent/20 bg-accent/5 text-xs text-accent-light mb-8 tracking-wide">
          Drop your URL. Get meetings.
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
          Your outbound team
          <br />
          that never clocks out
          <br />
          <span className="gradient-text inline-block min-w-[200px]">
            {words[wordIndex]}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted max-w-xl mx-auto mb-10 leading-relaxed">
          Feed it your website. It studies your market, pinpoints
          decision-makers, crafts one-off emails, and books calls
          &mdash; around the clock, for pennies.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLaunch()}
            placeholder="yourcompany.com"
            className="flex-1 px-5 py-3.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/50 transition text-sm"
          />
          <button
            onClick={handleLaunch}
            className="px-7 py-3.5 bg-secondary hover:bg-secondary/85 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm animate-pulse-glow"
          >
            Go <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-4 text-xs text-muted/60">
          Free to start &middot; No card needed &middot; Cancel anytime
        </p>
      </div>
    </section>
  );
}
