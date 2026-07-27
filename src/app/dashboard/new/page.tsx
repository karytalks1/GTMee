"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Globe,
  Loader2,
  CheckCircle2,
  Search,
  Users,
  Mail,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Building2,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Target,
  Send,
  Zap,
  Eye,
  PenLine,
  Radar,
} from "lucide-react";

type Phase = "start" | "scanning" | "intel" | "segments" | "prospecting" | "people" | "drafting" | "launch";

interface CompanyInfo {
  companyName: string;
  description: string;
  industry: string;
  valueProps: string[];
  pricingModel: string;
  companySize: string;
}

interface Competitor {
  name: string;
  website: string;
  similarity: string;
}

interface ICPSegment {
  segment: string;
  fitScore: number;
  description: string;
  jobTitles: string[];
  industries: string[];
}

interface Lead {
  name: string;
  email: string;
  title: string;
  company: string;
  source: string;
}

interface EmailDraft {
  leadName: string;
  leadTitle: string;
  leadCompany: string;
  to: string;
  subject: string;
  body: string;
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted">Loading...</div>}>
      <WizardFlow />
    </Suspense>
  );
}

function WizardFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [website, setWebsite] = useState(searchParams.get("website") || "");
  const [phase, setPhase] = useState<Phase>("start");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [segments, setSegments] = useState<ICPSegment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);
  const [error, setError] = useState("");
  const [activeSegment, setActiveSegment] = useState(0);
  const [activeDraft, setActiveDraft] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [campaignId, setCampaignId] = useState("");

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const domain = website.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const phaseOrder: Phase[] = ["start", "scanning", "intel", "segments", "prospecting", "people", "drafting", "launch"];
  const phaseIdx = phaseOrder.indexOf(phase);

  const handleAnalyze = useCallback(async () => {
    if (!website.trim()) return;
    setError("");
    setPhase("scanning");

    try {
      const res = await fetch("/api/campaigns/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: website.trim() }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setCompanyInfo(data.companyInfo);
      setCompetitors(data.competitors || []);
      setPhase("intel");

      // Continue to segment generation
      setPhase("segments");
      const icpRes = await fetch("/api/campaigns/icp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyInfo: data.companyInfo,
          competitors: data.competitors,
        }),
      });
      if (!icpRes.ok) throw new Error("Segment generation failed");
      const icpData = await icpRes.json();
      setSegments(icpData.segments || []);

      const campaignRes = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: website.trim(),
          companyInfo: data.companyInfo,
          competitors: data.competitors,
          icpSegments: icpData.segments,
        }),
      });
      if (campaignRes.ok) {
        const cData = await campaignRes.json();
        setCampaignId(cData.id);
      }
      setPhase("segments");
    } catch {
      setError("Couldn’t reach that site. Double-check the URL and retry.");
      setPhase("start");
    }
  }, [website]);

  const handleProspect = async () => {
    if (!campaignId) return;
    setPhase("prospecting");
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/find-leads`, { method: "POST" });
      if (!res.ok) throw new Error("Prospecting failed");
      const leadsRes = await fetch(`/api/leads?campaignId=${campaignId}`);
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      }
      setPhase("people");
    } catch {
      setPhase("people");
    }
  };

  const handleDraftEmails = async () => {
    setPhase("drafting");
    const targets = leads.filter((l) => l.email);
    const drafts: EmailDraft[] = [];

    for (const lead of targets.slice(0, 5)) {
      try {
        const res = await fetch("/api/campaigns/write-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyInfo: { name: companyInfo?.companyName, description: companyInfo?.description, website },
            lead: { name: lead.name, title: lead.title, company: lead.company },
          }),
        });
        if (res.ok) {
          const d = await res.json();
          drafts.push({ leadName: lead.name, leadTitle: lead.title, leadCompany: lead.company, to: lead.email, subject: d.subject, body: d.body });
        }
      } catch { /* skip */ }
    }

    if (drafts.length === 0) {
      for (const lead of leads.slice(0, 3)) {
        drafts.push({
          leadName: lead.name, leadTitle: lead.title, leadCompany: lead.company,
          to: lead.email || "pending",
          subject: `Quick question for ${lead.company}`,
          body: `Hey ${lead.name.split(" ")[0]},\n\nSpotted ${lead.company} and thought there might be a fit. We’re ${companyInfo?.companyName} — ${companyInfo?.description?.toLowerCase() || "we help teams grow"}.\n\nWorth a 10-min call?\n\nCheers,\n${companyInfo?.companyName}`,
        });
      }
    }

    setEmailDrafts(drafts);
    setPhase("launch");
  };

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Phase indicator — floating pills */}
      {phase !== "start" && (
        <div className="flex items-center gap-1.5 mb-8 flex-wrap">
          {[
            { id: "intel", icon: Eye, label: "Intel" },
            { id: "segments", icon: Target, label: "Audiences" },
            { id: "people", icon: Users, label: "Prospects" },
            { id: "launch", icon: Send, label: "Outreach" },
          ].map((p) => {
            const pIdx = phaseOrder.indexOf(p.id as Phase);
            const done = phaseIdx > pIdx;
            const active = phaseIdx === pIdx || (p.id === "intel" && (phase === "scanning" || phase === "intel"));
            const scanning = active && (phase === "scanning" || phase === "prospecting" || phase === "drafting" || (phase === "segments" && segments.length === 0));
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                  done
                    ? "bg-accent/15 text-accent-light"
                    : active
                      ? "bg-accent text-background shadow-[0_0_20px_rgba(0,200,150,0.3)]"
                      : "bg-card text-muted/50 border border-border"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : scanning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <p.icon className="w-3.5 h-3.5" />
                )}
                {p.label}
              </div>
            );
          })}
        </div>
      )}

      {/* ============ START ============ */}
      {phase === "start" && (
        <div className="pt-8 md:pt-16">
          <div className="relative p-8 md:p-12 rounded-3xl border border-border bg-card overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-light text-xs font-semibold tracking-wide">
                <Zap className="w-3 h-3" />
                AI-Powered Pipeline
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
                Build your outbound<br />
                <span className="gradient-text">in one shot</span>
              </h1>
              <p className="text-muted text-lg max-w-lg leading-relaxed">
                Drop your URL below. We&apos;ll dissect your market, surface the right buyers, and draft every cold email — ready to send.
              </p>

              {error && (
                <div className="p-3 rounded-xl bg-danger/10 text-danger text-sm border border-danger/20">{error}</div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="flex-1 relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/40" />
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    placeholder="paste your website"
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-background border border-border text-white placeholder:text-muted/30 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,200,150,0.1)] transition-all"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!website.trim()}
                  className="px-8 py-4 bg-accent hover:bg-accent/80 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_4px_20px_rgba(0,200,150,0.25)] hover:shadow-[0_4px_30px_rgba(0,200,150,0.4)]"
                >
                  <Radar className="w-5 h-5" />
                  Go
                </button>
              </div>

              <div className="flex items-center gap-6 pt-2 text-xs text-muted/60">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> 60-second setup</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> AI does the heavy lifting</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ SCANNING ============ */}
      {phase === "scanning" && (
        <div className="relative p-12 rounded-3xl border border-accent/20 bg-card text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,200,150,0.06)_0%,transparent_70%)]" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Radar className="w-8 h-8 text-accent-light" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Scanning {domain}</h2>
            <p className="text-muted max-w-md mx-auto">Pulling apart your site, mapping the competitive landscape, and profiling your ideal buyers</p>
            <div className="flex justify-center gap-1 mt-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-accent/40 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ INTEL (Company + Competitors) ============ */}
      {phaseIdx >= 2 && companyInfo && (
        <div className="space-y-3">
          {/* Collapsible intel header */}
          <button
            onClick={() => toggleSection("intel")}
            className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-card border border-border hover:border-border/80 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-accent-light" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{companyInfo.companyName}</p>
                <p className="text-xs text-muted">{domain} · {competitors.length} rivals mapped</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted transition-transform ${expandedSections.has("intel") ? "rotate-180" : ""}`} />
          </button>

          {expandedSections.has("intel") && (
            <div className="grid md:grid-cols-3 gap-3 animate-slide-up">
              {/* Company card */}
              <div className="md:col-span-2 p-5 rounded-2xl gradient-border space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-xl font-black text-accent-light shrink-0">
                    {companyInfo.companyName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{companyInfo.companyName}</h3>
                    <p className="text-xs text-muted mt-0.5">{companyInfo.industry} · {companyInfo.companySize}</p>
                  </div>
                </div>
                <p className="text-sm text-muted/80 leading-relaxed">{companyInfo.description}</p>
                {companyInfo.valueProps?.length > 0 && (
                  <div className="space-y-1.5">
                    {companyInfo.valueProps.map((v, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted">
                        <ChevronRight className="w-3 h-3 text-accent-light mt-1 shrink-0" />
                        {v}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Competitor list */}
              <div className="p-4 rounded-2xl border border-border bg-card space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Rivals</p>
                {competitors.map((c) => (
                  <div key={c.name} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-background/40 hover:bg-background/70 transition group cursor-default">
                    <div className="w-6 h-6 rounded-md bg-muted/10 flex items-center justify-center text-[10px] font-bold text-muted shrink-0">
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs truncate flex-1">{c.website || c.name}</span>
                    <ExternalLink className="w-3 h-3 text-muted/30 group-hover:text-muted shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ SEGMENTS (loading) ============ */}
      {phase === "segments" && segments.length === 0 && (
        <div className="p-12 rounded-3xl border border-border bg-card text-center">
          <Loader2 className="w-10 h-10 text-accent-light animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Carving out audiences</h2>
          <p className="text-muted">Mapping buyer personas that actually convert for your product</p>
        </div>
      )}

      {/* ============ SEGMENTS (loaded) ============ */}
      {phaseIdx >= 3 && segments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-light" />
              Your audiences
            </h2>
            <span className="text-xs text-muted bg-card px-3 py-1 rounded-full border border-border">{segments.length} segments</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {segments.map((seg, i) => {
              const isActive = activeSegment === i;
              return (
                <div
                  key={seg.segment}
                  onClick={() => setActiveSegment(i)}
                  className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 group ${
                    isActive
                      ? "border-accent/50 bg-accent/5 shadow-[0_0_30px_rgba(0,200,150,0.08)]"
                      : "border-border bg-card hover:border-border/60 hover:bg-card-hover"
                  }`}
                >
                  {isActive && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent animate-pulse" />}
                  <h3 className="font-bold text-sm mb-1.5">{seg.segment}</h3>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-3">{seg.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {seg.jobTitles?.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-background/60 text-muted/70">{t}</span>
                      ))}
                    </div>
                    <span className={`text-xs font-mono font-bold ${
                      seg.fitScore >= 85 ? "text-accent-light" : seg.fitScore >= 70 ? "text-warning" : "text-muted"
                    }`}>
                      {seg.fitScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============ PROSPECTING (loading) ============ */}
      {(phase === "prospecting") && (
        <div className="p-12 rounded-3xl border border-border bg-card text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-accent-light animate-pulse" />
          </div>
          <h2 className="text-xl font-bold mb-2">Hunting prospects</h2>
          <p className="text-muted">Scouring databases and the open web for matching buyers</p>
        </div>
      )}

      {/* ============ PEOPLE TABLE ============ */}
      {phaseIdx >= 5 && leads.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-light" />
              Prospect list
            </h2>
            <span className="text-xs text-muted bg-background/50 px-3 py-1 rounded-full">{leads.length} people</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-muted/60 uppercase tracking-widest border-b border-border/50">
                  <th className="text-left px-5 py-2.5 font-semibold">Person</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Role</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Organization</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Via</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-accent/[0.02] transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-[11px] font-bold text-accent-light shrink-0">
                          {initials(lead.name)}
                        </div>
                        <div>
                          <span className="font-medium text-sm">{lead.name}</span>
                          {lead.email && <p className="text-[11px] text-muted/50 truncate max-w-[200px]">{lead.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted text-xs">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 shrink-0" />
                        {lead.title || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted text-xs">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 shrink-0" />
                        {lead.company || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        lead.source === "hunter" ? "bg-orange-500/10 text-orange-400" :
                        lead.source === "apollo" ? "bg-blue-500/10 text-blue-400" :
                        "bg-muted/10 text-muted"
                      }`}>
                        {lead.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ DRAFTING (loading) ============ */}
      {phase === "drafting" && emailDrafts.length === 0 && (
        <div className="p-12 rounded-3xl border border-border bg-card text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <PenLine className="w-8 h-8 text-accent-light animate-pulse" />
          </div>
          <h2 className="text-xl font-bold mb-2">Composing messages</h2>
          <p className="text-muted">Writing a tailored pitch for each prospect</p>
        </div>
      )}

      {/* ============ EMAIL DRAFTS ============ */}
      {phaseIdx >= 7 && emailDrafts.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-accent-light" />
            Draft outreach
          </h2>
          <div className="grid md:grid-cols-5 gap-3">
            {/* Sidebar */}
            <div className="md:col-span-2 space-y-1.5 max-h-[480px] overflow-y-auto">
              {emailDrafts.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDraft(i)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    activeDraft === i
                      ? "border-accent/40 bg-accent/5"
                      : "border-transparent hover:bg-card-hover"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-[11px] font-bold text-accent-light shrink-0">
                      {initials(d.leadName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{d.leadName}</p>
                      <p className="text-[11px] text-muted truncate">{d.leadTitle} · {d.leadCompany}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="md:col-span-3 p-5 rounded-2xl gradient-border">
              {emailDrafts[activeDraft] && (() => {
                const d = emailDrafts[activeDraft];
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-border">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-sm font-bold text-accent-light">
                        {initials(d.leadName)}
                      </div>
                      <div>
                        <p className="font-bold">{d.leadName}</p>
                        <p className="text-xs text-muted">{d.leadTitle} · {d.leadCompany}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted w-10">To</span>
                        <span className="text-muted">{d.to}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted w-10">Subj</span>
                        <span className="font-semibold">{d.subject}</span>
                      </div>
                    </div>
                    <div className="pt-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">{d.body}</div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ============ ACTION BUTTONS ============ */}
      <div className="pt-6 space-y-3">
        {phase === "segments" && segments.length > 0 && (
          <button onClick={handleProspect} className="w-full py-4 bg-accent hover:bg-accent/80 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,200,150,0.25)] hover:shadow-[0_4px_30px_rgba(0,200,150,0.4)]">
            <Search className="w-5 h-5" />
            Hunt prospects
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {phase === "people" && leads.length > 0 && (
          <button onClick={handleDraftEmails} className="w-full py-4 bg-accent hover:bg-accent/80 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,200,150,0.25)] hover:shadow-[0_4px_30px_rgba(0,200,150,0.4)]">
            <PenLine className="w-5 h-5" />
            Draft messages
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {phase === "launch" && (
          <>
            <div className="flex items-center justify-center gap-4 py-3 text-xs text-muted">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-accent-light" /> Emails ready</span>
              <span className="text-border">→</span>
              <span>Send & track</span>
              <span className="text-border">→</span>
              <span>Book calls</span>
              <span className="text-border">→</span>
              <span>Close deals</span>
            </div>
            <button
              onClick={() => router.push("/dashboard/campaigns")}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-[#00b4d8] hover:opacity-90 shadow-[0_4px_30px_rgba(0,200,150,0.3)] animate-pulse-glow"
            >
              <Send className="w-5 h-5" />
              Launch campaign
            </button>
          </>
        )}
      </div>
    </div>
  );
}
