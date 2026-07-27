"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Upload,
  ExternalLink,
  Briefcase,
  Building2,
  Mail,
  Filter,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  linkedIn: string;
  status: string;
  fitScore: number;
  source: string;
  createdAt: string;
  campaign: { id: string; name: string };
}

const sourceConfig: Record<string, { label: string; color: string }> = {
  hunter: { label: "Hunter.io", color: "bg-orange-500/10 text-orange-400" },
  apollo: { label: "Apollo", color: "bg-blue-500/10 text-blue-400" },
  "linkedin-search": {
    label: "LinkedIn",
    color: "bg-sky-500/10 text-sky-400",
  },
  "web-search": {
    label: "Web Search",
    color: "bg-purple-500/10 text-purple-400",
  },
  "company-site": {
    label: "Company Site",
    color: "bg-accent/10 text-accent-light",
  },
  scraping: { label: "Scraped", color: "bg-muted/10 text-muted" },
  manual: { label: "Manual", color: "bg-foreground/10 text-foreground" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-accent/10 text-accent-light" },
  CONTACTED: { label: "Contacted", color: "bg-blue-500/10 text-blue-400" },
  REPLIED: { label: "Replied", color: "bg-warning/10 text-warning" },
  QUALIFIED: { label: "Qualified", color: "bg-success/10 text-success" },
  UNQUALIFIED: { label: "Unqualified", color: "bg-muted/10 text-muted" },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sources = [...new Set(leads.map((l) => l.source).filter(Boolean))];

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.title?.toLowerCase().includes(search.toLowerCase());
    const matchSource = sourceFilter === "all" || l.source === sourceFilter;
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchSource && matchStatus;
  });

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted mt-1">
            {leads.length} contacts across all campaigns
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-card-hover transition">
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, email, or title..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="pl-9 pr-8 py-3 rounded-xl bg-card border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:border-accent transition"
            >
              <option value="all">All sources</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {sourceConfig[s]?.label || s}
                </option>
              ))}
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:border-accent transition"
          >
            <option value="all">All statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="REPLIED">Replied</option>
            <option value="QUALIFIED">Qualified</option>
          </select>
        </div>
      </div>

      {/* Source summary chips */}
      {leads.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sources.map((s) => {
            const count = leads.filter((l) => l.source === s).length;
            const cfg = sourceConfig[s] || {
              label: s,
              color: "bg-muted/10 text-muted",
            };
            return (
              <button
                key={s}
                onClick={() =>
                  setSourceFilter(sourceFilter === s ? "all" : s)
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  sourceFilter === s
                    ? "ring-2 ring-accent/50 " + cfg.color
                    : cfg.color + " opacity-70 hover:opacity-100"
                }`}
              >
                {cfg.label}
                <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted">Loading leads...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border">
          <Users className="w-12 h-12 text-accent-light mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {leads.length === 0 ? "No leads yet" : "No matching leads"}
          </h3>
          <p className="text-muted">
            {leads.length === 0
              ? "Create a campaign to start finding leads automatically"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted">
            Showing {filtered.length} of {leads.length} leads
          </p>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] text-muted/60 uppercase tracking-widest">
                    <th className="text-left px-5 py-3 font-semibold">
                      Person
                    </th>
                    <th className="text-left px-5 py-3 font-semibold">Role</th>
                    <th className="text-left px-5 py-3 font-semibold">
                      Company
                    </th>
                    <th className="text-left px-5 py-3 font-semibold">
                      Score
                    </th>
                    <th className="text-left px-5 py-3 font-semibold">
                      Source
                    </th>
                    <th className="text-left px-5 py-3 font-semibold">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 font-semibold">
                      Campaign
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const src = sourceConfig[lead.source] || {
                      label: lead.source || "Unknown",
                      color: "bg-muted/10 text-muted",
                    };
                    const st = statusConfig[lead.status] || {
                      label: lead.status,
                      color: "bg-muted/10 text-muted",
                    };
                    return (
                      <tr
                        key={lead.id}
                        className="border-b border-border/30 hover:bg-accent/[0.02] transition"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-[11px] font-bold text-accent-light shrink-0">
                              {initials(lead.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {lead.name}
                              </p>
                              {lead.email && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-muted/40" />
                                  <span className="text-[11px] text-muted/50 truncate max-w-[180px]">
                                    {lead.email}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {lead.title ? (
                            <div className="flex items-center gap-1.5 text-muted text-xs">
                              <Briefcase className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[150px]">
                                {lead.title}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted/30">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {lead.company ? (
                            <div className="flex items-center gap-1.5 text-muted text-xs">
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[140px]">
                                {lead.company}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted/30">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`font-mono text-xs font-bold ${
                              (lead.fitScore || 0) >= 85
                                ? "text-accent-light"
                                : (lead.fitScore || 0) >= 70
                                  ? "text-warning"
                                  : "text-muted"
                            }`}
                          >
                            {lead.fitScore || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${src.color}`}
                          >
                            {src.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${st.color}`}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {lead.campaign ? (
                            <a
                              href={`/dashboard/campaigns/${lead.campaign.id}`}
                              className="text-xs text-muted hover:text-accent-light transition truncate max-w-[120px] inline-flex items-center gap-1"
                            >
                              {lead.campaign.name}
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-muted/30">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
