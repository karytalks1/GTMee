"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Users,
  Mail,
  ArrowLeft,
  Search,
  PenLine,
  Send,
  Loader2,
  CheckCircle2,
  Building2,
  Briefcase,
  ExternalLink,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  website: string;
  description: string;
  status: string;
  icpData: {
    segments: {
      segment: string;
      fitScore: number;
      jobTitles: string[];
    }[];
  } | null;
  competitors: { name: string; website?: string }[] | null;
  createdAt: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  linkedIn: string;
  fitScore: number;
  status: string;
  source: string;
}

interface EmailDraft {
  id: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  lead: { name: string; company: string } | null;
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
};

const statusColors: Record<string, string> = {
  ANALYZING: "bg-warning/10 text-warning",
  FINDING_LEADS: "bg-accent/10 text-accent-light",
  READY: "bg-success/10 text-success",
  SENDING: "bg-accent/10 text-accent-light",
  COMPLETED: "bg-muted/10 text-muted",
  PAUSED: "bg-muted/10 text-muted",
};

type Tab = "leads" | "emails" | "overview";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [emails, setEmails] = useState<EmailDraft[]>([]);
  const [tab, setTab] = useState<Tab>("leads");
  const [loading, setLoading] = useState(true);
  const [findingLeads, setFindingLeads] = useState(false);
  const [draftingEmails, setDraftingEmails] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/campaigns/${id}`).then((r) => r.json()),
      fetch(`/api/leads?campaignId=${id}`).then((r) => r.json()),
      fetch(`/api/emails?campaignId=${id}`).then((r) => r.json()),
    ])
      .then(([cData, lData, eData]) => {
        setCampaign(cData.error ? null : (cData.campaign || cData));
        setLeads(lData.leads || []);
        setEmails(eData.emails || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleFindLeads = async () => {
    setFindingLeads(true);
    try {
      await fetch(`/api/campaigns/${id}/find-leads`, { method: "POST" });
      const res = await fetch(`/api/leads?campaignId=${id}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setTab("leads");
    } catch {
      /* ignore */
    }
    setFindingLeads(false);
  };

  const handleDraftEmails = async () => {
    setDraftingEmails(true);
    const targets = leads.filter((l) => l.email).slice(0, 5);
    for (const lead of targets) {
      try {
        await fetch("/api/campaigns/write-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: id,
            companyInfo: {
              name: campaign?.name,
              description: campaign?.description,
              website: campaign?.website,
            },
            lead: {
              name: lead.name,
              title: lead.title,
              company: lead.company,
            },
            leadId: lead.id,
          }),
        });
      } catch {
        /* skip */
      }
    }
    const res = await fetch(`/api/emails?campaignId=${id}`);
    const data = await res.json();
    setEmails(data.emails || []);
    setTab("emails");
    setDraftingEmails(false);
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent-light" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-16">
        <p className="text-muted mb-4">Campaign not found</p>
        <Link
          href="/dashboard/campaigns"
          className="text-accent-light hover:underline"
        >
          Back to campaigns
        </Link>
      </div>
    );
  }

  const sources = [...new Set(leads.map((l) => l.source).filter(Boolean))];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push("/dashboard/campaigns")}
            className="mt-1 p-2 rounded-lg hover:bg-card transition"
          >
            <ArrowLeft className="w-4 h-4 text-muted" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${statusColors[campaign.status] || "bg-muted/10 text-muted"}`}
              >
                {campaign.status.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                {campaign.website}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {leads.length} leads
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {emails.length} emails
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleFindLeads}
            disabled={findingLeads}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            {findingLeads ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {findingLeads ? "Finding..." : "Find Leads"}
          </button>
          {leads.length > 0 && (
            <button
              onClick={handleDraftEmails}
              disabled={draftingEmails}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              {draftingEmails ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PenLine className="w-4 h-4" />
              )}
              {draftingEmails ? "Drafting..." : "Draft Emails"}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Leads Found",
            value: leads.length,
            icon: Users,
          },
          {
            label: "Emails Drafted",
            value: emails.length,
            icon: Mail,
          },
          {
            label: "Sent",
            value: emails.filter(
              (e) =>
                e.status === "SENT" ||
                e.status === "OPENED" ||
                e.status === "REPLIED"
            ).length,
            icon: Send,
          },
          {
            label: "Replies",
            value: emails.filter((e) => e.status === "REPLIED").length,
            icon: CheckCircle2,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-2xl border border-border bg-card text-center"
          >
            <s.icon className="w-5 h-5 text-accent-light mx-auto mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(
          [
            { key: "leads" as Tab, label: "Leads", icon: Users, count: leads.length },
            { key: "emails" as Tab, label: "Emails", icon: Mail, count: emails.length },
            { key: "overview" as Tab, label: "Overview", icon: Globe, count: null },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
              tab === t.key
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count !== null && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-card text-muted">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* LEADS TAB */}
      {tab === "leads" && (
        <>
          {sources.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sources.map((s) => {
                const count = leads.filter((l) => l.source === s).length;
                const cfg = sourceConfig[s] || {
                  label: s,
                  color: "bg-muted/10 text-muted",
                };
                return (
                  <div
                    key={s}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${cfg.color}`}
                  >
                    {cfg.label}
                    <span className="opacity-60">{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {leads.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border">
              <Users className="w-12 h-12 text-accent-light mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
              <p className="text-muted mb-6">
                Find real prospects from LinkedIn, company sites, and web
                directories
              </p>
              <button
                onClick={handleFindLeads}
                disabled={findingLeads}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/80 rounded-xl font-medium transition disabled:opacity-50"
              >
                {findingLeads ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {findingLeads ? "Searching..." : "Find Leads"}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-[11px] text-muted/60 uppercase tracking-widest">
                      <th className="text-left px-5 py-3 font-semibold">
                        Person
                      </th>
                      <th className="text-left px-5 py-3 font-semibold">
                        Role
                      </th>
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
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => {
                      const src = sourceConfig[lead.source] || {
                        label: lead.source || "—",
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
                                  <p className="text-[11px] text-muted/50 truncate max-w-[180px]">
                                    {lead.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {lead.title ? (
                              <div className="flex items-center gap-1.5 text-muted text-xs">
                                <Briefcase className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[140px]">
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
                                <span className="truncate max-w-[130px]">
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
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${src.color}`}
                            >
                              {src.label}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-accent/10 text-accent-light">
                              {lead.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* EMAILS TAB */}
      {tab === "emails" && (
        <>
          {emails.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border">
              <Mail className="w-12 h-12 text-accent-light mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No emails drafted</h3>
              <p className="text-muted mb-6">
                {leads.length > 0
                  ? "Draft personalized emails for your leads"
                  : "Find leads first, then draft emails"}
              </p>
              {leads.length > 0 && (
                <button
                  onClick={handleDraftEmails}
                  disabled={draftingEmails}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-medium transition disabled:opacity-50"
                >
                  {draftingEmails ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PenLine className="w-4 h-4" />
                  )}
                  {draftingEmails ? "Drafting..." : "Draft Emails"}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="p-5 rounded-2xl border border-border bg-card hover:bg-card-hover transition"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      {email.lead && (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center text-[11px] font-bold text-secondary shrink-0">
                          {initials(email.lead.name)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm">{email.subject}</p>
                        {email.lead && (
                          <p className="text-xs text-muted mt-0.5">
                            To: {email.lead.name}{" "}
                            {email.lead.company
                              ? `at ${email.lead.company}`
                              : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 ${
                        email.status === "SENT"
                          ? "bg-success/10 text-success"
                          : email.status === "OPENED"
                            ? "bg-blue-500/10 text-blue-400"
                            : email.status === "REPLIED"
                              ? "bg-warning/10 text-warning"
                              : "bg-muted/10 text-muted"
                      }`}
                    >
                      {email.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted/70 whitespace-pre-wrap line-clamp-3 pl-12">
                    {email.body}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-4">
          {campaign.icpData?.segments && (
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-light" />
                ICP Segments
              </h3>
              <div className="space-y-3">
                {campaign.icpData.segments.map((seg) => (
                  <div
                    key={seg.segment}
                    className="p-3 rounded-xl bg-background/40"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{seg.segment}</p>
                      <span
                        className={`font-mono text-xs font-bold ${
                          seg.fitScore >= 85
                            ? "text-accent-light"
                            : "text-warning"
                        }`}
                      >
                        {seg.fitScore}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {seg.jobTitles?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-card text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {campaign.competitors &&
            (campaign.competitors as { name: string; website?: string }[])
              .length > 0 && (
              <div className="p-5 rounded-2xl border border-border bg-card">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-accent-light" />
                  Competitors
                </h3>
                <div className="space-y-2">
                  {(
                    campaign.competitors as {
                      name: string;
                      website?: string;
                    }[]
                  ).map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center justify-between p-3 rounded-xl bg-background/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-muted/10 flex items-center justify-center text-[10px] font-bold text-muted">
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm">{c.name}</span>
                      </div>
                      {c.website && (
                        <a
                          href={
                            c.website.startsWith("http")
                              ? c.website
                              : `https://${c.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-accent-light transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {campaign.description && (
            <div className="md:col-span-2 p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent-light" />
                Company Analysis
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {campaign.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
