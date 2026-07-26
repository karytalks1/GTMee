"use client";

import Link from "next/link";
import {
  Rocket,
  Users,
  Mail,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from "lucide-react";

const stats = [
  {
    label: "Active Campaigns",
    value: "0",
    change: "",
    icon: Rocket,
    color: "text-accent-light",
  },
  {
    label: "Total Leads",
    value: "0",
    change: "",
    icon: Users,
    color: "text-success",
  },
  {
    label: "Emails Sent",
    value: "0",
    change: "",
    icon: Mail,
    color: "text-warning",
  },
  {
    label: "Reply Rate",
    value: "0%",
    change: "",
    icon: TrendingUp,
    color: "text-accent-light",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted mt-1">Overview of your outreach performance</p>
        </div>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 rounded-xl text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl border border-border bg-card"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              {stat.change && (
                <span className="flex items-center gap-0.5 text-xs text-success">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      <div className="text-center py-16 rounded-2xl border border-dashed border-border">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Rocket className="w-8 h-8 text-accent-light" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Launch your first campaign
        </h3>
        <p className="text-muted max-w-md mx-auto mb-6">
          Paste your website URL and our AI agent will analyze your business,
          find ideal customers, and start reaching out automatically.
        </p>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/80 rounded-xl font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted">
          No activity yet. Launch a campaign to get started.
        </div>
      </div>
    </div>
  );
}
