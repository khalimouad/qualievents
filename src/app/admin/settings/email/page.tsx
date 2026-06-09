"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Save, Mail, CheckCircle2, AlertTriangle, Send, CreditCard } from "lucide-react";

interface EmailSettingsData {
  id: string | null;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassMasked: string;
  senderName: string;
  senderEmail: string;
  updatedAt: string | null;
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const [form, setForm] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    senderName: "",
    senderEmail: "",
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/email-settings");
    const data = await res.json();
    setSettings(data);
    setForm({
      smtpHost: data.smtpHost || "",
      smtpPort: String(data.smtpPort || 587),
      smtpUser: data.smtpUser || "",
      smtpPass: "",
      senderName: data.senderName || "Qualivoire Connect",
      senderEmail: data.senderEmail || "",
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/email-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Échec de la sauvegarde"); setSaving(false); return; }
    setSettings(data);
    setSavedAt(Date.now());
    setForm(f => ({ ...f, smtpPass: "" }));
    setSaving(false);
  };

  const sendTest = async () => {
    if (!testTo) return;
    setTesting(true);
    setTestResult(null);
    const res = await fetch("/api/email-settings/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: testTo }),
    });
    const data = await res.json();
    setTestResult(data);
    setTesting(false);
  };

  const field = (label: string, key: keyof typeof form, opts?: { type?: string; placeholder?: string; hint?: string }) => (
    <div>
      <label className="block text-xs font-semibold text-muted mb-1">{label}</label>
      <input
        type={opts?.type || "text"}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={opts?.placeholder}
        className="w-full px-3 py-2.5 bg-subtle border border-border rounded-xl text-sm focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
        autoComplete="off"
      />
      {opts?.hint && <p className="text-[10px] text-muted mt-1">{opts.hint}</p>}
    </div>
  );

  return (
    <div className="max-w-xl">
      {/* Settings tabs */}
      <div className="flex gap-1 p-1 bg-subtle rounded-xl border border-border mb-6 w-fit">
        <Link href="/admin/settings/payments" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors">
          <CreditCard className="w-3.5 h-3.5" /> Paiements
        </Link>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card text-foreground shadow-sm border border-border">
          <Mail className="w-3.5 h-3.5" /> Email / SMTP
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground">Configuration email</h1>
          <p className="text-xs text-muted">SMTP sortant et nom de l&apos;expéditeur</p>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center"><div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" /></div>
      ) : (
        <>
          <div className="card p-5 space-y-4 mb-4">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">Serveur SMTP</p>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                {field("Hôte SMTP", "smtpHost", { placeholder: "smtp.gmail.com" })}
              </div>
              <div>
                {field("Port", "smtpPort", { placeholder: "587", hint: "465 = SSL, 587 = TLS" })}
              </div>
            </div>

            {field("Utilisateur SMTP", "smtpUser", { placeholder: "vous@domaine.com" })}
            {field("Mot de passe SMTP", "smtpPass", {
              type: "password",
              placeholder: settings?.smtpPassMasked ? "Laisser vide pour conserver l'actuel" : "Mot de passe ou app password",
            })}
          </div>

          <div className="card p-5 space-y-4 mb-4">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">Expéditeur</p>
            {field("Nom de l'expéditeur", "senderName", {
              placeholder: "Qualivoire Connect",
              hint: "Affiché comme nom dans la boîte de réception du destinataire",
            })}
            {field("Email de l'expéditeur", "senderEmail", {
              placeholder: "Laisser vide pour utiliser l'utilisateur SMTP",
              hint: "Optionnel — si différent de l'utilisateur SMTP",
            })}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm mb-4">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {savedAt && (
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm mb-4">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Paramètres sauvegardés
            </div>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="btn-primary w-full py-2.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 mb-6"
          >
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>

          {/* Test email */}
          <div className="card p-5">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">Tester la configuration</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={testTo}
                onChange={e => setTestTo(e.target.value)}
                placeholder="adresse@test.com"
                className="flex-1 px-3 py-2.5 bg-subtle border border-border rounded-xl text-sm focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
              />
              <button
                onClick={sendTest}
                disabled={testing || !testTo}
                className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium hover:border-primary transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {testing ? <span className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer
              </button>
            </div>
            {testResult && (
              <div className={`mt-3 flex items-center gap-2 p-3 rounded-xl text-sm ${testResult.ok ? "bg-success/10 border border-success/20 text-success" : "bg-danger/10 border border-danger/20 text-danger"}`}>
                {testResult.ok
                  ? <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Email de test envoyé avec succès</>
                  : <><AlertTriangle className="w-4 h-4 flex-shrink-0" /> {testResult.error || "Échec de l'envoi"}</>
                }
              </div>
            )}
          </div>

          {settings?.updatedAt && (
            <p className="text-[10px] text-muted text-center mt-4">
              Dernière mise à jour : {new Date(settings.updatedAt).toLocaleString("fr-FR")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
