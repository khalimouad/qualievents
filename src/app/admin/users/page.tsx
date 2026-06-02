"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, KeyRound, ToggleLeft, ToggleRight, Trash2, Shield, User as UserIcon, QrCode } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff" | "scanner";
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Jamais";
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d > 30) return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });
  if (d >= 1) return `il y a ${d} j`;
  const h = Math.floor(ms / 3600000);
  if (h >= 1) return `il y a ${h} h`;
  const m = Math.floor(ms / 60000);
  if (m >= 1) return `il y a ${m} min`;
  return "à l'instant";
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ name: string; tempPassword: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Échec du chargement");
      setUsers(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (u: AdminUser) => {
    setError(null);
    const res = await fetch(`/api/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec");
      return;
    }
    load();
  };

  const remove = async (u: AdminUser) => {
    if (!confirm(`Supprimer ${u.name} (${u.email}) ? Cette action est irréversible.`)) return;
    setError(null);
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec de la suppression");
      return;
    }
    load();
  };

  const resetPassword = async (u: AdminUser) => {
    if (!confirm(`Réinitialiser le mot de passe de ${u.name} ?`)) return;
    setError(null);
    const res = await fetch(`/api/users/${u.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec");
      return;
    }
    const data = await res.json();
    setResetResult({ name: u.name, tempPassword: data.tempPassword });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Gérez les comptes administrateurs et staff.
          </p>
        </div>
        <Link href="/admin/users/new" className="btn-primary px-4 py-2.5 text-xs inline-flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Nouvel utilisateur
        </Link>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {resetResult && (
        <div className="card p-4 border-warning/40 bg-warning/5">
          <p className="text-sm text-foreground font-medium mb-2">
            Mot de passe temporaire pour <strong>{resetResult.name}</strong>
          </p>
          <code className="block px-3 py-2 bg-card border border-border rounded-md text-sm font-mono select-all">
            {resetResult.tempPassword}
          </code>
          <p className="text-[11px] text-text-secondary mt-2">
            Communiquez-le à l&apos;utilisateur de manière sécurisée. Il ne sera plus affiché.
          </p>
          <button onClick={() => setResetResult(null)} className="mt-2 text-xs text-text-secondary hover:text-foreground">
            Fermer
          </button>
        </div>
      )}

      <section className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <UserIcon className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
            <p className="text-text-secondary text-sm">Aucun utilisateur</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-subtle/50">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Nom</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Rôle</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-secondary uppercase tracking-wider hidden sm:table-cell">Statut</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Dernière connexion</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="group hover:bg-subtle/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${u.role === "admin" ? "bg-primary/10 text-primary" : u.role === "scanner" ? "bg-emerald-500/10 text-emerald-600" : "bg-subtle text-text-secondary"}`}>
                        {u.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="text-sm font-medium text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary hidden md:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${u.role === "admin" ? "bg-primary/10 text-primary" : u.role === "scanner" ? "bg-emerald-500/10 text-emerald-600" : "bg-subtle text-text-secondary"}`}>
                      {u.role === "admin" ? <Shield className="w-3 h-3" /> : u.role === "scanner" ? <QrCode className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${u.active ? "bg-success/10 text-success" : "bg-bg-subtle text-text-secondary"}`}>
                      {u.active ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary hidden md:table-cell">{relativeTime(u.lastLoginAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/users/${u.id}/edit`} className="p-1.5 rounded hover:bg-primary/10 text-text-secondary hover:text-primary" title="Modifier">
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={() => resetPassword(u)} className="p-1.5 rounded hover:bg-warning/10 text-text-secondary hover:text-warning" title="Réinitialiser le mot de passe">
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleActive(u)} className="p-1.5 rounded hover:bg-hover text-text-secondary hover:text-foreground" title={u.active ? "Désactiver" : "Activer"}>
                        {u.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => remove(u)} className="p-1.5 rounded hover:bg-danger/10 text-text-secondary hover:text-danger" title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
