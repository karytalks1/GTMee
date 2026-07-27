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
  MapPin,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Target,
  Send,
  UserCheck,
} from "lucide-react";

type Step = "input" | "research" | "competitors" | "campaigns" | "customers" | "decision-makers" | "emails" | "ready";

const STEPS: { key: Step; label: string; num: number }[] = [
  { key: "research", label: "Research your company", num: 1 },
  { key: "competitors", label: "Explore competitors", num: 2 },
  { key: "campaigns", label: "Define campaigns", num: 3 },
  { key: "customers", label: "Find potential customers", num: 4 },
  { key: "decision-makers", label: "Find decision makers", num: 5 },
  { key: "emails", label: "Write emails", num: 6 },
];

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
  painPoint?: string;
  criteria?: string[];
  exampleCompanies?: string[];
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
      <NewCampaignContent />
    </Suspense>
  );
}

function NewCampaignContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [website, setWebsite] = useState(searchParams.get("website") || "");
  const [step, setStep] = useState<Step>("input");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [icpSegments, setIcpSegments] = useState<ICPSegment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [expandedCompetitors, setExpandedCompetitors] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<number>(0);
  const [selectedLead, setSelectedLead] = useState<number>(0);
  const [campaignId, setCampaignId] = useState<string>("");

  const stepIndex = (s: Step) => {
    if (s === "input") return -1;
    if (s === "ready") return 6;
    return STEPS.findIndex((x) => x.key === s);
  };

  const currentIdx = stepIndex(step);

  const handleLaunch = useCallback(async () => {
    if (!website.trim()) return;
    setError("");
    setStep("research");
    setLoadingMsg("Scraping website and analyzing your business...");

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
      setStep("competitors");

      // Auto-advance to ICP/campaigns
      setLoadingMsg("Generating ideal customer profiles...");
      setStep("campaigns");

      const icpRes = await fetch("/api/campaigns/icp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyInfo: data.companyInfo,
          competitors: data.competitors,
        }),
      });

      if (!icpRes.ok) throw new Error("ICP generation failed");
      const icpData = await icpRes.json();
      const segments = (icpData.segments || []).map((s: ICPSegment) => ({
        ...s,
        painPoint: s.painPoint || s.description,
        criteria: s.criteria || s.industries?.slice(0, 3) || [],
        exampleCompanies: s.exampleCompanies || [],
      }));
      setIcpSegments(segments);
      setStep("campaigns");

      // Create the campaign in DB
      const campaignRes = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: website.trim(),
          companyInfo: data.companyInfo,
          competitors: data.competitors,
          icpSegments: segments,
        }),
      });

      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        setCampaignId(campaignData.id);
      }

    } catch {
      setError("Failed to analyze website. Please check the URL and try again.");
      setStep("input");
    }
  }, [website]);

  const handleFindLeads = async () => {
    if (!campaignId) return;
    setStep("customers");
    setLoadingMsg("Searching for potential customers...");

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/find-leads`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Lead finding failed");

      const leadsRes = await fetch(`/api/leads?campaignId=${campaignId}`);
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      }
      setStep("decision-makers");
    } catch {
      setError("Failed to find leads. You can still launch the campaign.");
      setStep("decision-makers");
    }
  };

  const handleWriteEmails = async () => {
    setStep("emails");
    setLoadingMsg("Writing personalized emails...");

    const leadsWithEmail = leads.filter((l) => l.email);
    const drafts: EmailDraft[] = [];

    for (const lead of leadsWithEmail.slice(0, 5)) {
      try {
        const res = await fetch("/api/campaigns/write-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyInfo: {
              name: companyInfo?.companyName,
              description: companyInfo?.description,
              website,
            },
            lead: { name: lead.name, title: lead.title, company: lead.company },
          }),
        });
        if (res.ok) {
          const emailData = await res.json();
          drafts.push({
            leadName: lead.name,
            leadTitle: lead.title,
            leadCompany: lead.company,
            to: lead.email,
            subject: emailData.subject,
            body: emailData.body,
          });
        }
      } catch {
        // skip failed emails
      }
    }

    if (drafts.length === 0 && leadsWithEmail.length === 0) {
      for (const lead of leads.slice(0, 3)) {
        drafts.push({
          leadName: lead.name,
          leadTitle: lead.title,
          leadCompany: lead.company,
          to: "email not found",
          subject: `${companyInfo?.companyName} x ${lead.company}`,
          body: `Hi ${lead.name.split(" ")[0]},\n\nI noticed ${lead.company} is doing great work. We at ${companyInfo?.companyName} help companies like yours ${companyInfo?.description?.toLowerCase() || "grow faster"}.\n\nWould love to share how — open to a quick chat?\n\nBest,\n${companyInfo?.companyName}`,
        });
      }
    }

    setEmailDrafts(drafts);
    setStep("ready");
  };

  const handleLaunchCampaign = async () => {
    if (campaignId) {
      router.push(`/dashboard/campaigns`);
    }
  };

  const domain = website.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Progress bar */}
      {step !== "input" && (
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const isDone = i < currentIdx;
            const isCurrent = i === currentIdx;
            const isLoading = isCurrent && (step === "research" || loadingMsg) && !["competitors", "campaigns", "decision-makers", "ready"].includes(step);
            return (
              <div key={s.key} className="flex items-center flex-1 min-w-0">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                      isDone
                        ? "bg-accent/20 border-accent text-accent-light"
                        : isCurrent
                          ? "border-accent text-accent-light bg-accent/10"
                          : "border-border text-muted"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  {isCurrent && (
                    <span className="text-sm font-medium text-accent-light flex items-center gap-2">
                      {isLoading && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                      {s.label}
                    </span>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${isDone ? "bg-accent/50" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Step: Input */}
      {step === "input" && (
        <div className="max-w-2xl mx-auto pt-16 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-accent-light" />
            </div>
            <h1 className="text-3xl font-bold">Start a new campaign</h1>
            <p className="text-muted text-lg">
              Paste your website — AI will research your market, find customers, and write emails
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-danger/10 text-danger text-sm">{error}</div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLaunch()}
              placeholder="yourcompany.com"
              className="flex-1 px-5 py-4 rounded-xl bg-card border border-border text-white text-lg placeholder:text-muted/40 focus:outline-none focus:border-accent transition"
            />
            <button
              onClick={handleLaunch}
              disabled={!website.trim()}
              className="px-8 py-4 bg-accent hover:bg-accent/80 rounded-xl font-semibold text-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              Analyze
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Research loading */}
      {step === "research" && (
        <div className="p-12 rounded-2xl border border-border bg-card text-center">
          <Loader2 className="w-12 h-12 text-accent-light animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Researching {domain}...</h2>
          <p className="text-muted">{loadingMsg}</p>
        </div>
      )}

      {/* Step 2: Competitors (visible once we have company info) */}
      {currentIdx >= 1 && companyInfo && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left: Product info */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-lg font-bold text-accent-light shrink-0">
                {companyInfo.companyName[0]?.toUpperCase() || "C"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg">{companyInfo.companyName}</h3>
                <p className="text-xs text-muted">{domain}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent-light text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Found
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed">{companyInfo.description}</p>
            {companyInfo.valueProps?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Product</p>
                <p className="text-sm font-semibold">{companyInfo.industry}</p>
                {companyInfo.valueProps.map((v, i) => (
                  <p key={i} className="text-sm text-muted">{v}</p>
                ))}
              </div>
            )}
          </div>

          {/* Right: Competitors */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Competitors</p>
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent-light text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {competitors.length} found
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(expandedCompetitors ? competitors : competitors.slice(0, 8)).map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 text-sm group hover:bg-background/80 transition"
                >
                  <div className="w-6 h-6 rounded bg-muted/20 flex items-center justify-center text-xs font-bold text-muted shrink-0">
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <span className="truncate flex-1 text-xs">{c.website || c.name}</span>
                  <ExternalLink className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 shrink-0" />
                </div>
              ))}
            </div>
            {competitors.length > 8 && (
              <button
                onClick={() => setExpandedCompetitors(!expandedCompetitors)}
                className="text-xs text-accent-light hover:underline flex items-center gap-1"
              >
                {expandedCompetitors ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expandedCompetitors ? "Show less" : `+${competitors.length - 8} more`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Campaigns / ICP Segments */}
      {step === "campaigns" && icpSegments.length === 0 && (
        <div className="p-12 rounded-2xl border border-border bg-card text-center">
          <Loader2 className="w-12 h-12 text-accent-light animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Defining campaigns...</h2>
          <p className="text-muted">Identifying ideal customer segments for your product</p>
        </div>
      )}

      {currentIdx >= 2 && icpSegments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Campaigns</p>
            <span className="text-xs text-muted">{icpSegments.length} segments</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {icpSegments.map((seg, i) => (
              <div
                key={seg.segment}
                onClick={() => setSelectedSegment(i)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedSegment === i
                    ? "border-accent bg-accent/5"
                    : "border-border bg-card hover:border-border/80 hover:bg-card-hover"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent-light" />
                    <h3 className="font-semibold text-sm">{seg.segment}</h3>
                  </div>
                  <span className="text-xs font-mono text-muted">{(seg.fitScore / 10).toFixed(1)}K</span>
                </div>
                <p className="text-xs text-muted mb-3 line-clamp-2">{seg.description}</p>
                {seg.painPoint && seg.painPoint !== seg.description && (
                  <div className="mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded">Pain</span>
                    <p className="text-xs text-muted mt-1">{seg.painPoint}</p>
                  </div>
                )}
                {seg.jobTitles?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {seg.jobTitles.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-background/80 text-muted">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4-5: Leads / Decision Makers */}
      {(step === "customers" || step === "decision-makers") && leads.length === 0 && (
        <div className="p-12 rounded-2xl border border-border bg-card text-center">
          <Loader2 className="w-12 h-12 text-accent-light animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {step === "customers" ? "Finding potential customers..." : "Finding decision makers..."}
          </h2>
          <p className="text-muted">{loadingMsg || "Searching across multiple data sources"}</p>
        </div>
      )}

      {currentIdx >= 4 && leads.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-accent-light" />
              <p className="text-sm font-semibold">Decision Makers</p>
            </div>
            <span className="text-xs text-muted">{leads.length} found</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted uppercase tracking-wider border-b border-border">
                  <th className="text-left px-5 py-3 font-semibold">Name</th>
                  <th className="text-left px-5 py-3 font-semibold">Job Title</th>
                  <th className="text-left px-5 py-3 font-semibold">Company</th>
                  <th className="text-left px-5 py-3 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedLead(i)}
                    className={`border-b border-border/50 cursor-pointer transition ${
                      selectedLead === i ? "bg-accent/5" : "hover:bg-card-hover"
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent-light shrink-0">
                          {lead.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <span className="font-medium">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3" />
                        {lead.title || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" />
                        {lead.company || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
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

      {/* Step 6: Email Drafts */}
      {step === "emails" && emailDrafts.length === 0 && (
        <div className="p-12 rounded-2xl border border-border bg-card text-center">
          <Loader2 className="w-12 h-12 text-accent-light animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Writing personalized emails...</h2>
          <p className="text-muted">Crafting unique outreach for each decision maker</p>
        </div>
      )}

      {currentIdx >= 5 && emailDrafts.length > 0 && (
        <div className="grid md:grid-cols-5 gap-4">
          {/* Left: lead list */}
          <div className="md:col-span-2 space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {emailDrafts.map((draft, i) => (
              <div
                key={i}
                onClick={() => setSelectedLead(i)}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedLead === i ? "border-accent bg-accent/5" : "border-border bg-card hover:bg-card-hover"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent-light shrink-0">
                    {draft.leadName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{draft.leadName}</p>
                    <p className="text-xs text-muted truncate">{draft.leadTitle} · {draft.leadCompany}</p>
                  </div>
                  {draft.to !== "email not found" && (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  )}
                </div>
                {draft.to !== "email not found" && (
                  <p className="text-xs text-muted mt-1.5 pl-10 truncate">{draft.to}</p>
                )}
              </div>
            ))}
          </div>

          {/* Right: email preview */}
          <div className="md:col-span-3 p-5 rounded-2xl border border-border bg-card">
            {emailDrafts[selectedLead] && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent-light">
                    {emailDrafts[selectedLead].leadName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold">{emailDrafts[selectedLead].leadName}</p>
                    <p className="text-xs text-muted">{emailDrafts[selectedLead].leadTitle} · {emailDrafts[selectedLead].leadCompany}</p>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-muted">
                    <span className="text-xs font-semibold uppercase tracking-wider mr-2">To</span>
                    {emailDrafts[selectedLead].to}
                  </p>
                  <p className="text-muted">
                    <span className="text-xs font-semibold uppercase tracking-wider mr-2">Subj</span>
                    <span className="text-white font-medium">{emailDrafts[selectedLead].subject}</span>
                  </p>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80 pt-2">
                  {emailDrafts[selectedLead].body}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {step === "campaigns" && icpSegments.length > 0 && (
        <button
          onClick={handleFindLeads}
          className="w-full py-4 bg-accent hover:bg-accent/80 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-lg"
        >
          <Users className="w-5 h-5" />
          Find Potential Customers
          <ArrowRight className="w-5 h-5" />
        </button>
      )}

      {step === "decision-makers" && leads.length > 0 && (
        <button
          onClick={handleWriteEmails}
          className="w-full py-4 bg-accent hover:bg-accent/80 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-lg"
        >
          <Mail className="w-5 h-5" />
          Write Emails
          <ArrowRight className="w-5 h-5" />
        </button>
      )}

      {step === "ready" && (
        <div className="space-y-4">
          {/* What happens next */}
          <div className="flex items-center justify-center gap-6 py-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-accent bg-accent/10 flex items-center justify-center mx-auto mb-1">
                <Send className="w-4 h-4 text-accent-light" />
              </div>
              <p className="text-xs text-muted">Send emails</p>
            </div>
            <div className="w-8 h-px bg-border" />
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center mx-auto mb-1">
                <Globe className="w-4 h-4 text-muted" />
              </div>
              <p className="text-xs text-muted">Book meetings</p>
            </div>
            <div className="w-8 h-px bg-border" />
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center mx-auto mb-1">
                <Sparkles className="w-4 h-4 text-muted" />
              </div>
              <p className="text-xs text-muted">Learn & double down</p>
            </div>
          </div>

          <button
            onClick={handleLaunchCampaign}
            className="w-full py-4 bg-accent hover:bg-accent/80 rounded-xl font-bold transition flex items-center justify-center gap-2 text-lg animate-pulse-glow"
          >
            <Send className="w-5 h-5" />
            Start Outreach
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
