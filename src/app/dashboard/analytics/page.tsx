"use client";

import { BarChart3, TrendingUp, Mail, Users, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted mt-1">Track your outreach performance</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Emails Sent", value: "0", icon: Mail, color: "text-accent-light" },
          { label: "Open Rate", value: "0%", icon: TrendingUp, color: "text-success" },
          { label: "Reply Rate", value: "0%", icon: BarChart3, color: "text-warning" },
          { label: "Leads Generated", value: "0", icon: Users, color: "text-accent-light" },
          { label: "Cost per Lead", value: "$0", icon: DollarSign, color: "text-success" },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl border border-border bg-card">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="p-8 rounded-2xl border border-border bg-card">
        <h3 className="font-semibold mb-4">Email Performance Over Time</h3>
        <div className="h-64 flex items-center justify-center text-muted">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Charts will appear once you have campaign data</p>
          </div>
        </div>
      </div>

      {/* Segment Performance */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <h3 className="font-semibold mb-4">Segment Performance</h3>
        <div className="text-center py-8 text-muted">
          No segment data yet. Launch a campaign to see performance by segment.
        </div>
      </div>
    </div>
  );
}
