"use client";

import { useEffect, useState } from "react";
import { Mail, Send, Eye, Reply } from "lucide-react";

interface Email {
  id: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  repliedAt: string | null;
  lead: { name: string; company: string } | null;
  campaign: { name: string };
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selected, setSelected] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/emails")
      .then((res) => res.json())
      .then((data) => {
        setEmails(data.emails || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case "SENT":
      case "DELIVERED":
        return <Send className="w-3.5 h-3.5 text-success" />;
      case "OPENED":
        return <Eye className="w-3.5 h-3.5 text-warning" />;
      case "REPLIED":
        return <Reply className="w-3.5 h-3.5 text-accent-light" />;
      default:
        return <Mail className="w-3.5 h-3.5 text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Emails</h1>
        <p className="text-muted mt-1">{emails.length} emails across all campaigns</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading emails...</div>
      ) : emails.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border">
          <Mail className="w-12 h-12 text-accent-light mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No emails yet</h3>
          <p className="text-muted">
            Emails will appear here once you start a campaign
          </p>
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="w-full md:w-1/2 space-y-2">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelected(email)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  selected?.id === email.id
                    ? "border-accent bg-accent/5"
                    : "border-border bg-card hover:bg-card-hover"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon(email.status)}
                  <span className="text-sm font-medium truncate">
                    {email.subject}
                  </span>
                </div>
                <p className="text-xs text-muted truncate">
                  To: {email.lead?.name || "Unknown"} at{" "}
                  {email.lead?.company || "Unknown"}
                </p>
              </button>
            ))}
          </div>

          {selected && (
            <div className="hidden md:block flex-1 p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{selected.subject}</h3>
                <span className="px-2 py-0.5 rounded text-xs bg-accent/10 text-accent-light">
                  {selected.status}
                </span>
              </div>
              <div className="text-sm text-muted mb-4">
                To: {selected.lead?.name} · {selected.campaign.name}
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {selected.body}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
