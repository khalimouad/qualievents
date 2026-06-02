"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, Eye, EyeOff } from "lucide-react";

function generatePassword(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 14);
}

export default function NewUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", role: "scanner", password: "" });
  const [showPwd, setShowPwd] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Échec de la création");
      }
      router.push("/admin/users");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la création");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "input-base";
  const labelClass = "block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1";

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-foreground text-xs font-medium transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Retour aux utilisateurs
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Nouvel utilisateur</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Créer un compte administrateur ou staff. Le mot de passe initial est affiché une seule fois.
        </p>
      </div>

      <form onSubmit={submit} className="card p-5 space-y-4">
        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nom *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Jean Dupont" />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="jean@exemple.com" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Rôle *</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
            <option value="scanner">Scanner — Accès scan uniquement</option>
            <option value="staff">Staff — Accès lecture/édition + scanner</option>
            <option value="admin">Admin — Accès complet (suppressions, paramètres, utilisateurs)</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Mot de passe initial *</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                required
                minLength={8}
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`${inputClass} pr-9 font-mono`}
                placeholder="8 caractères minimum"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-foreground"
                aria-label={showPwd ? "Masquer" : "Afficher"}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-subtle border border-border text-text-secondary hover:text-foreground hover:border-primary text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" /> Générer
            </button>
          </div>
          <p className="text-[10px] text-text-secondary mt-1">
            L&apos;utilisateur pourra le changer après sa première connexion.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
            <Save className="w-3 h-3" /> {saving ? "Création…" : "Créer l'utilisateur"}
          </button>
          <Link href="/admin/users" className="px-4 py-2 text-xs text-text-secondary hover:text-foreground font-medium transition-colors">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
