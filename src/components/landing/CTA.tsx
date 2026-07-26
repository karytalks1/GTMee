import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-28 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="p-14 rounded-3xl border border-accent/20 bg-gradient-to-b from-accent/5 to-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,200,150,0.06),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Your pipeline won&apos;t fill itself
            </h2>
            <p className="text-base text-muted mb-8 max-w-md mx-auto leading-relaxed">
              Sixty seconds from now you could have an AI agent qualifying
              leads. Or you could keep scrolling.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/85 text-background rounded-xl font-semibold transition animate-pulse-glow text-sm"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
