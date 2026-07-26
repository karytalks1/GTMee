"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Rocket,
  Globe,
  Users,
  Mail,
  ChevronRight,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  website: string;
  status: string;
  _count: { leads: number; emails: number };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  ANALYZING: "bg-warning/10 text-warning",
  FINDING_LEADS: "bg-accent/10 text-accent-light",
  READY: "bg-success/10 text-success",
  SENDING: "bg-accent/10 text-accent-light",
  SCALING: "bg-success/10 text-success",
  PAUSED: "bg-muted/10 text-muted",
  COMPLETED: "bg-muted/10 text-muted",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        setCampaigns(data.campaigns || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted mt-1">Manage your outreach campaigns</p>
        </div>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 rounded-xl text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border">
          <Rocket className="w-12 h-12 text-accent-light mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
          <p className="text-muted mb-6">
            Create your first campaign to start finding leads
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/80 rounded-xl font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/dashboard/campaigns/${campaign.id}`}
              className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:bg-card-hover transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-accent-light" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold truncate">{campaign.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[campaign.status] || ""}`}
                  >
                    {campaign.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {campaign._count.leads} leads
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {campaign._count.emails} emails
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-white transition" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
