"use client";

import { Suspense, useState } from "react";
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
} from "lucide-react";

type Step =
  | "input"
  | "analyzing"
  | "competitors"
  | "icp"
  | "leads"
  | "emails"
  | "ready";

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
  const [error, setError] = useState("");

  const handleLaunch = async () => {
    if (!website.trim()) return;
    setError("");
    setStep("analyzing");

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

      // Auto-advance to ICP
      setTimeout(async () => {
        setStep("icp");
        const icpRes = await fetch("/api/campaigns/icp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyInfo: data.companyInfo,
            competitors: data.competitors,
          }),
        });

        if (icpRes.ok) {
          const icpData = await icpRes.json();
          setIcpSegments(icpData.segments || []);
          setStep("ready");
        }
      }, 2000);
    } catch {
      setError("Failed to analyze website. Please check the URL and try again.");
      setStep("input");
    }
  };

  const handleCreateCampaign = async () => {
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        website,
        companyInfo,
        competitors,
        icpSegments,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/campaigns/${data.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">New Campaign</h1>
        <p className="text-muted mt-1">
          Paste your website and let AI do the rest
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: "input", label: "Website", icon: Globe },
          { key: "analyzing", label: "Analyzing", icon: Search },
          { key: "competitors", label: "Competitors", icon: Search },
          { key: "icp", label: "ICP", icon: Users },
          { key: "ready", label: "Ready", icon: Mail },
        ].map((s, i) => {
          const steps: Step[] = [
            "input",
            "analyzing",
            "competitors",
            "icp",
            "ready",
          ];
          const currentIndex = steps.indexOf(step);
          const stepIndex = i;
          const isDone = stepIndex < currentIndex;
          const isCurrent = steps[stepIndex] === step;

          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isDone
                    ? "bg-success/10 text-success"
                    : isCurrent
                      ? "bg-accent/10 text-accent-light"
                      : "bg-background/50 text-muted"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isCurrent && step !== "input" && step !== "ready" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <s.icon className="w-3.5 h-3.5" />
                )}
                {s.label}
              </div>
              {i < 4 && (
                <div
                  className={`w-6 h-px ${isDone ? "bg-success" : "bg-border"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Input Step */}
      {step === "input" && (
        <div className="p-8 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-accent-light" />
            </div>
            <div>
              <h2 className="font-semibold">Enter your website</h2>
              <p className="text-sm text-muted">
                We&apos;ll analyze your business and find ideal customers
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLaunch()}
              placeholder="yourcompany.com"
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-white placeholder:text-muted/50 focus:outline-none focus:border-accent transition"
            />
            <button
              onClick={handleLaunch}
              disabled={!website.trim()}
              className="px-6 py-3 bg-accent hover:bg-accent/80 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Analyze
            </button>
          </div>
        </div>
      )}

      {/* Analyzing Step */}
      {step === "analyzing" && (
        <div className="p-8 rounded-2xl border border-border bg-card text-center">
          <Loader2 className="w-10 h-10 text-accent-light animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Analyzing {website}...
          </h2>
          <p className="text-muted">
            Our AI is studying your website, products, and market position
          </p>
        </div>
      )}

      {/* Competitors Step */}
      {step === "competitors" && companyInfo && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Company Analysis
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted">Name:</span>{" "}
                <span className="font-medium">{companyInfo.companyName}</span>
              </p>
              <p>
                <span className="text-muted">Description:</span>{" "}
                {companyInfo.description}
              </p>
              <p>
                <span className="text-muted">Industry:</span>{" "}
                {companyInfo.industry}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card">
            <h2 className="font-semibold mb-3">Competitors Found</h2>
            <div className="space-y-2">
              {competitors.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-background/50 text-sm"
                >
                  <span>{c.name}</span>
                  <span className="text-xs text-muted">{c.website}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ICP Step */}
      {step === "icp" && (
        <div className="p-8 rounded-2xl border border-border bg-card text-center">
          <Loader2 className="w-10 h-10 text-accent-light animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Generating Ideal Customer Profiles...
          </h2>
          <p className="text-muted">
            Identifying who would benefit most from your product
          </p>
        </div>
      )}

      {/* Ready Step */}
      {step === "ready" && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-success/30 bg-success/5">
            <h2 className="font-semibold mb-1 flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              Analysis Complete
            </h2>
            <p className="text-sm text-muted">
              Found {icpSegments.length} target segments for{" "}
              {companyInfo?.companyName}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card">
            <h2 className="font-semibold mb-4">Target Segments</h2>
            <div className="space-y-3">
              {icpSegments.map((seg) => (
                <div
                  key={seg.segment}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-background/50"
                >
                  <div>
                    <p className="font-medium text-sm">{seg.segment}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {seg.description}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-mono font-bold ${
                      seg.fitScore >= 85
                        ? "text-success"
                        : seg.fitScore >= 70
                          ? "text-warning"
                          : "text-muted"
                    }`}
                  >
                    {seg.fitScore}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateCampaign}
            className="w-full py-3.5 bg-accent hover:bg-accent/80 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            Launch Campaign
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
