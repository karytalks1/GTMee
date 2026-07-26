import Link from "next/link";
import { Rocket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Rocket className="w-4.5 h-4.5 text-background" />
              </div>
              <span className="text-lg font-bold tracking-tight">gtmee</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Outbound on autopilot. Built for founders and growth teams who&apos;d rather close than cold-call.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <div className="space-y-2 text-xs text-muted">
              <Link href="#how" className="block hover:text-foreground transition">How it works</Link>
              <Link href="#why" className="block hover:text-foreground transition">Why us</Link>
              <Link href="#pricing" className="block hover:text-foreground transition">Pricing</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Tools</h4>
            <div className="space-y-2 text-xs text-muted">
              <Link href="/dashboard" className="block hover:text-foreground transition">Dashboard</Link>
              <Link href="#" className="block hover:text-foreground transition">Company Search</Link>
              <Link href="#" className="block hover:text-foreground transition">Lead Finder</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <div className="space-y-2 text-xs text-muted">
              <Link href="/terms" className="block hover:text-foreground transition">Terms</Link>
              <Link href="/privacy" className="block hover:text-foreground transition">Privacy</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} gtmee. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
