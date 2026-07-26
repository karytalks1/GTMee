"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Rocket,
  LayoutDashboard,
  Users,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/campaigns", icon: Rocket, label: "Campaigns" },
  { href: "/dashboard/leads", icon: Users, label: "Leads" },
  { href: "/dashboard/emails", icon: Mail, label: "Emails" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">gtmee</span>
          </Link>
        </div>

        <div className="p-3">
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 w-full px-4 py-2.5 bg-accent hover:bg-accent/80 rounded-xl text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition",
                  isActive
                    ? "bg-accent/10 text-accent-light"
                    : "text-muted hover:text-white hover:bg-background/50"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/50">
            <CreditCard className="w-4 h-4 text-accent-light" />
            <span className="text-sm text-muted">Credits:</span>
            <span className="text-sm font-bold text-accent-light">$30</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent-light">
              {session?.user?.name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-muted truncate">
                {session?.user?.email || ""}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-background/50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">gtmee</span>
          </Link>
          <Link
            href="/dashboard/new"
            className="p-2 bg-accent rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </header>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 border-t border-border bg-card z-50">
          {navItems.slice(0, 5).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition",
                  isActive ? "text-accent-light" : "text-muted"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
