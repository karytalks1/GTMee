"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Key, Mail, Globe, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [geminiKey, setGeminiKey] = useState("");
  const [resendKey, setResendKey] = useState("");
  const [hunterKey, setHunterKey] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        geminiKey: geminiKey || undefined,
        resendKey: resendKey || undefined,
        hunterKey: hunterKey || undefined,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted mt-1">Manage your account and API keys</p>
      </div>

      {/* Profile */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent-light" />
          Profile
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted block mb-1">Name</label>
            <input
              type="text"
              defaultValue={session?.user?.name || ""}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-white focus:outline-none focus:border-accent transition"
            />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">Email</label>
            <input
              type="email"
              defaultValue={session?.user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border text-muted"
            />
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Key className="w-4 h-4 text-accent-light" />
          API Keys
        </h2>
        <p className="text-sm text-muted">
          Configure your API keys for AI, email sending, and lead finding.
          All keys are encrypted and stored securely.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted block mb-1">
              Google Gemini API Key
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-light ml-2 hover:underline"
              >
                Get free key
              </a>
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-white placeholder:text-muted/30 focus:outline-none focus:border-accent transition"
            />
          </div>

          <div>
            <label className="text-sm text-muted block mb-1">
              Resend API Key
              <a
                href="https://resend.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-light ml-2 hover:underline"
              >
                Get free key
              </a>
            </label>
            <input
              type="password"
              value={resendKey}
              onChange={(e) => setResendKey(e.target.value)}
              placeholder="re_..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-white placeholder:text-muted/30 focus:outline-none focus:border-accent transition"
            />
          </div>

          <div>
            <label className="text-sm text-muted block mb-1">
              Hunter.io API Key
              <a
                href="https://hunter.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-light ml-2 hover:underline"
              >
                Get free key
              </a>
            </label>
            <input
              type="password"
              value={hunterKey}
              onChange={(e) => setHunterKey(e.target.value)}
              placeholder="Enter Hunter.io API key"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-white placeholder:text-muted/30 focus:outline-none focus:border-accent transition"
            />
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Mail className="w-4 h-4 text-accent-light" />
          Email Settings
        </h2>
        <div>
          <label className="text-sm text-muted block mb-1">
            From email address
          </label>
          <input
            type="email"
            placeholder="outreach@yourdomain.com"
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-white placeholder:text-muted/30 focus:outline-none focus:border-accent transition"
          />
          <p className="text-xs text-muted mt-1">
            Must be a verified domain in your Resend account
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/80 rounded-xl font-medium transition"
      >
        {saved ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Saved!
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Settings
          </>
        )}
      </button>
    </div>
  );
}
