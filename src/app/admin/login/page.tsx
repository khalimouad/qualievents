"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, Shield } from "lucide-react";
import { t } from "@/lib/i18n";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({})) as { user?: { role?: string; name?: string; email?: string }; error?: string };
      if (!res.ok) throw new Error(data.error || t.admin.login.invalid);

      if (data.user?.role === "staff" || data.user?.role === "scanner") {
        window.location.href = "/scan";
      } else {
        window.location.href = "/admin";
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.admin.login.invalid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t.admin.login.title}</h1>
          <p className="text-text-secondary text-sm mt-1">{t.admin.login.sub}</p>
        </div>

        <form onSubmit={submit} className="bg-card rounded-[24px] shadow-lg p-7 border border-border">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl mb-5 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">{t.admin.login.emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="w-full px-4 py-3.5 bg-subtle border border-border rounded-xl focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm text-foreground placeholder:text-text-secondary/60"
                placeholder="admin@qualivoire.com"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">{t.admin.login.passwordLabel}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="w-full px-4 py-3.5 bg-subtle border border-border rounded-xl focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all text-sm text-foreground placeholder:text-text-secondary/60"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-primary w-full mt-6 py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.admin.login.signingIn}</>
            ) : (
              <>{t.admin.login.signIn} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-1">
          <p className="text-text-secondary text-xs">{t.admin.login.adminRole}</p>
          <p className="text-text-secondary text-xs">{t.admin.login.staffRole}</p>
        </div>
      </div>
    </div>
  );
}
