"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff" | "scanner";
  active: boolean;
  lastLoginAt: string | null;
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: "", role: "scanner" as "admin" | "staff" | "scanner", active: true });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((u) => {
        if (u.error) { setError(u.error); return; }
        setUser(u);
        setForm({ name: u.name, role: u.role as "admin" | "staff" | "scanner", active: u.active });
        setLoading(false);
      });
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Échec de l'enregistrement");
      }
      router.push("/admin/users");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setSaving(false);
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
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-foreground text-xs font-medium transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Retour aux utilisateurs
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Modifier l&apos;utilisateur</h1>
        <p className="text-text-secondary text-sm mt-0.5">{user?.email}</p>
      </div>

      <form onSubmit={submit} className="card p-5 space-y-4">
        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>Nom *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Rôle</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "staff" | "scanner" })} className={inputClass}>
            <option value="scanner">Scanner — scan uniquement</option>
            <option value="staff">Staff — lecture/édition + scanner</option>
            <option value="admin">Admin — accès complet</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <span className="text-sm text-foreground">Compte actif</span>
        </label>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
            <Save className="w-3 h-3" /> {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <Link href="/admin/users" className="px-4 py-2 text-xs text-text-secondary hover:text-foreground font-medium transition-colors">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
