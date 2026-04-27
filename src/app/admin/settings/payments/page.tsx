"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Settings as SettingsIcon, AlertTriangle, CheckCircle2, FlaskConical } from "lucide-react";

interface PublicSettings {
  id: string;
  provider: string;
  enabled: boolean;
  mode: "TEST" | "PRODUCTION";
  apiKeyMasked: string;
  siteIdMasked: string;
  secretKeyMasked: string;
  notifyUrl: string | null;
  returnUrl: string | null;
  currency: string;
  updatedAt: string;
  updatedById: string | null;
}

type TestResult =
  | { ok: true; providerMessage: string; mode: string }
  | { ok: false; error: string };

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [test, setTest] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);

  // Editable form state. Secret fields stay empty unless the user types
  // something — empty means "leave the stored secret unchanged".
  const [form, setForm] = useState({
    enabled: false,
    mode: "TEST" as "TEST" | "PRODUCTION",
    apiKey: "",
    siteId: "",
    secretKey: "",
    notifyUrl: "",
    returnUrl: "",
    currency: "XOF",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/settings");
      if (!res.ok) throw new Error("Échec du chargement");
      const s: PublicSettings = await res.json();
      setSettings(s);
      setForm({
        enabled: s.enabled,
        mode: s.mode,
        apiKey: "",
        siteId: "",
        secretKey: "",
        notifyUrl: s.notifyUrl || "",
        returnUrl: s.returnUrl || "",
        currency: s.currency,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec du chargement");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Échec de l'enregistrement");
      }
      const s: PublicSettings = await res.json();
      setSettings(s);
      // Clear secret fields after successful save
      setForm((f) => ({ ...f, apiKey: "", siteId: "", secretKey: "" }));
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setSaving(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setTest(null);
    try {
      const res = await fetch("/api/payments/settings/test", { method: "POST" });
      const data = await res.json();
      setTest(data);
    } catch (e) {
      setTest({ ok: false, error: e instanceof Error ? e.message : "Échec" });
    } finally {
      setTesting(false);
    }
  };

  const inputClass = "input-base";
  const labelClass = "block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1";

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-foreground text-xs font-medium transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Tableau de bord
      </Link>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paiements</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Configurez le fournisseur de paiement utilisé pour les inscriptions payantes.
          </p>
        </div>
      </div>

      {form.mode === "PRODUCTION" && (
        <div className="card p-3 border-warning/40 bg-warning/5 flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          <span className="text-foreground">
            Mode <strong>PRODUCTION</strong> — les paiements sont réels.
          </span>
        </div>
      )}

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Fournisseur</label>
            <select disabled value="cinetpay" className={inputClass}>
              <option value="cinetpay">CinetPay (Côte d&apos;Ivoire)</option>
            </select>
            <p className="text-[10px] text-text-secondary mt-1">D&apos;autres fournisseurs seront ajoutés.</p>
          </div>
          <div>
            <label className={labelClass}>Mode</label>
            <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as "TEST" | "PRODUCTION" })} className={inputClass}>
              <option value="TEST">Test (sandbox)</option>
              <option value="PRODUCTION">Production</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground">Activer les paiements en ligne</span>
        </label>

        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
            Identifiants — laissez vide pour ne pas modifier
          </p>

          <div>
            <label className={labelClass}>API Key</label>
            <input
              type="password"
              autoComplete="off"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              className={`${inputClass} font-mono`}
              placeholder={settings?.apiKeyMasked || "Saisissez votre API key"}
            />
          </div>

          <div>
            <label className={labelClass}>Site ID</label>
            <input
              type="password"
              autoComplete="off"
              value={form.siteId}
              onChange={(e) => setForm({ ...form, siteId: e.target.value })}
              className={`${inputClass} font-mono`}
              placeholder={settings?.siteIdMasked || "Saisissez votre Site ID"}
            />
          </div>

          <div>
            <label className={labelClass}>Secret Key (pour la signature des webhooks)</label>
            <input
              type="password"
              autoComplete="off"
              value={form.secretKey}
              onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
              className={`${inputClass} font-mono`}
              placeholder={settings?.secretKeyMasked || "Saisissez votre Secret key"}
            />
            <p className="text-[10px] text-text-secondary mt-1">
              Sans cette clé, les webhooks de paiement seront rejetés en production.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Devise</label>
            <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
          <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
            <Save className="w-3 h-3" />
            {saving ? "Enregistrement…" : savedAt && Date.now() - savedAt < 3000 ? "Enregistré" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={runTest}
            disabled={testing}
            className="px-4 py-2 text-xs inline-flex items-center gap-1.5 rounded-full bg-subtle border border-border text-foreground hover:border-primary disabled:opacity-50"
          >
            <FlaskConical className="w-3 h-3" />
            {testing ? "Test en cours…" : "Tester la connexion"}
          </button>
          {settings?.updatedAt && (
            <p className="text-[11px] text-text-secondary ml-auto">
              Modifié {new Date(settings.updatedAt).toLocaleString("fr-FR")}
            </p>
          )}
        </div>

        {test && (
          <div
            className={`mt-2 p-3 rounded-lg text-sm flex items-start gap-2 ${
              test.ok ? "bg-success/10 border border-success/30 text-success" : "bg-danger/10 border border-danger/30 text-danger"
            }`}
          >
            {test.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <div>
              <p className="font-medium">{test.ok ? "Identifiants valides" : "Échec du test"}</p>
              <p className="text-xs mt-0.5 text-foreground/80">
                {test.ok ? `${test.providerMessage} (mode ${test.mode})` : test.error}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
