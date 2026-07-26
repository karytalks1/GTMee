"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Globe,
  Users,
  Mail,
  TrendingUp,
  Play,
  Pause,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  website: string;
  description: string;
  status: string;
  icpData: { segments: { segment: string; fitScore: number }[] } | null;
  competitors: { name: string; website: string }[] | null;
  leads: {
    id: string;
    name: string;
    email: string;
    title: string;
    company: string;
    status: string;
    fitScore: number;
  }[];
  emails: {
    id: string;
    subject: string;
    status: string;
    sentAt: string | null;
    lead: { name: string } | null;
  }[];
  segments: {
    id: string;
    name: string;
    fitScore: number;
    status: string;
    costPerLead: number | null;
  }[];
}

type Tab = "overview" | "leads" | "emails" | "segments";

export default function CampaignDetailPage() {
  const params = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    fetch(`/api/campaigns/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCampaign(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    await fetch(`/api/campaigns/${params.id}/${action}`, { method: "POST" });
    const res = await fetch(`/api/campaigns/${params.id}`);
    const data = await res.json();
    setCampaign(data);
    setActionLoading("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent-light" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20 text-muted">Campaign not found</div>
    );
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "leads", label: "Leads", count: campaign.leads.length },
    { key: "emails", label: "Emails", count: campaign.emails.length },
    { key: "segments", label: "Segments", count: campaign.segments.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Globe className="w-4 h-4 text-muted" />
            <span className="text-muted text-sm">{campaign.website}</span>
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent-light">
              {campaign.status.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {campaign.status === "READY" && (
            <button
              onClick={() => handleAction("find-leads")}
              disabled={!!actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              {actionLoading === "find-leads" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              Find Leads
            </button>
          )}
          {(campaign.status === "READY" || campaign.status === "SENDING") && (
            <button
              onClick={() => handleAction("send-emails")}
              disabled={!!actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success hover:bg-success/20 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              {actionLoading === "send-emails" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Emails
            </button>
          )}
          {campaign.status === "SENDING" || campaign.status === "SCALING" ? (
            <button
              onClick={() => handleAction("pause")}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-card-hover transition"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          ) : campaign.status === "PAUSED" ? (
            <button
              onClick={() => handleAction("resume")}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-xl text-sm font-medium transition"
            >
              <Play className="w-4 h-4" />
              Resume
            </button>
          ) : null}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Leads Found",
            value: campaign.leads.length,
            icon: Users,
            color: "text-accent-light",
          },
          {
            label: "Emails Sent",
            value: campaign.emails.filter((e) => e.status === "SENT").length,
            icon: Mail,
            color: "text-success",
          },
          {
            label: "Replies",
            value: campaign.emails.filter((e) => e.status === "REPLIED").length,
            icon: TrendingUp,
            color: "text-warning",
          },
          {
            label: "Meetings",
            value: campaign.leads.filter((l) => l.status === "MEETING_BOOKED")
              .length,
            icon: CheckCircle2,
            color: "text-success",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-2xl border border-border bg-card"
          >
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 ${
              activeTab === tab.key
                ? "border-accent text-white"
                : "border-transparent text-muted hover:text-white"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-muted">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold mb-3">Company Analysis</h3>
            <p className="text-sm text-muted">{campaign.description}</p>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold mb-3">Competitors</h3>
            <div className="space-y-2">
              {(
                campaign.competitors as { name: string; website: string }[] | null
              )?.map((c) => (
                <div
                  key={c.name}
                  className="text-sm flex items-center justify-between"
                >
                  <span>{c.name}</span>
                  <span className="text-xs text-muted">{c.website}</span>
                </div>
              )) || (
                <p className="text-sm text-muted">No competitor data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "leads" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {campaign.leads.length === 0 ? (
            <div className="p-8 text-center text-muted">
              No leads found yet. Click &ldquo;Find Leads&rdquo; to start
              prospecting.
            </div>
          ) : (
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
                  </tr>
                </thead>
                <tbody>
                  {campaign.leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-border/50 hover:bg-card-hover"
                    >
                      <td className="px-4 py-3 font-medium">{lead.name}</td>
                      <td className="px-4 py-3 text-muted">{lead.title}</td>
                      <td className="px-4 py-3 text-muted">{lead.company}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "emails" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {campaign.emails.length === 0 ? (
            <div className="p-8 text-center text-muted">
              No emails drafted yet. Find leads first, then send emails.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {campaign.emails.map((email) => (
                <div
                  key={email.id}
                  className="px-5 py-4 hover:bg-card-hover transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{email.subject}</p>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        email.status === "SENT"
                          ? "bg-success/10 text-success"
                          : email.status === "REPLIED"
                            ? "bg-accent/10 text-accent-light"
                            : "bg-background/50 text-muted"
                      }`}
                    >
                      {email.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    To: {email.lead?.name || "Unknown"}
                    {email.sentAt &&
                      ` · Sent ${new Date(email.sentAt).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "segments" && (
        <div className="space-y-3">
          {campaign.segments.length === 0 ? (
            <div className="p-8 text-center text-muted rounded-2xl border border-border bg-card">
              No segments created yet.
            </div>
          ) : (
            campaign.segments.map((seg) => (
              <div
                key={seg.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card"
              >
                <div>
                  <p className="font-medium">{seg.name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    Fit score: {seg.fitScore}%
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      seg.status === "scaling"
                        ? "bg-success/10 text-success"
                        : seg.status === "paused"
                          ? "bg-muted/10 text-muted"
                          : "bg-accent/10 text-accent-light"
                    }`}
                  >
                    {seg.status}
                  </span>
                  {seg.costPerLead && (
                    <span className="text-sm font-mono text-muted">
                      ${seg.costPerLead.toFixed(2)}/lead
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
