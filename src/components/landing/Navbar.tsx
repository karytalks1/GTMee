"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Rocket } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Rocket className="w-4.5 h-4.5 text-background" />
            </div>
            <span className="text-xl font-bold tracking-tight">gtmee</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#how" className="text-muted text-sm hover:text-foreground transition">
              How it works
            </Link>
            <Link href="#why" className="text-muted text-sm hover:text-foreground transition">
              Why us
            </Link>
            <Link href="#pricing" className="text-muted text-sm hover:text-foreground transition">
              Pricing
            </Link>
            <Link href="/login" className="text-muted text-sm hover:text-foreground transition">
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-accent hover:bg-accent/80 text-background rounded-lg text-sm font-semibold transition"
            >
              Start free
            </Link>
          </div>

          <button className="md:hidden text-muted" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-4 space-y-3">
            {[
              { href: "#how", label: "How it works" },
              { href: "#why", label: "Why us" },
              { href: "#pricing", label: "Pricing" },
              { href: "/login", label: "Log in" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-muted hover:text-foreground text-sm"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/signup"
              className="block px-4 py-2 bg-accent rounded-lg text-center text-sm font-semibold text-background"
              onClick={() => setOpen(false)}
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
