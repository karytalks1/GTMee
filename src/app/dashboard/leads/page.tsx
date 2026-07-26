"use client";

import { useEffect, useState } from "react";
import { Users, Search, Upload } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  status: string;
  fitScore: number;
  source: string;
  campaign: { name: string };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
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

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase())
  );

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads by name, company, or email..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-white placeholder:text-muted/50 focus:outline-none focus:border-accent transition"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading leads...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border">
          <Users className="w-12 h-12 text-accent-light mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
          <p className="text-muted">
            Create a campaign to start finding leads automatically
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Campaign</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-border/50 hover:bg-card-hover transition"
                  >
                    <td className="px-4 py-3 font-medium">{lead.name}</td>
                    <td className="px-4 py-3 text-muted">
                      {lead.title || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {lead.company || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {lead.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          (lead.fitScore || 0) >= 80
                            ? "text-success"
                            : "text-warning"
                        }
                      >
                        {lead.fitScore || "—"}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-background/50">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {lead.campaign?.name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
