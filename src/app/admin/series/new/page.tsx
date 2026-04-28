"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function NewSeriesPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", heroImage: "", brochureUrl: "",
    themeColor: "#ff7a00", isPublished: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la création");
      router.push(`/admin/series/${data.slug}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "input-base";
  const labelClass = "block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1";

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/admin/series" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-foreground text-xs font-medium transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Tous les programmes
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Nouveau programme</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Un programme regroupe plusieurs événements (ex&nbsp;: une tournée de séminaires).
        </p>
      </div>

      <form onSubmit={submit} className="card p-5 space-y-4">
        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div>
          <label className={labelClass}>Titre *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="QUALI CONNECT 2026" />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} rows={3} />
        </div>
        <ImageUpload value={form.heroImage} onChange={(url) => setForm({ ...form, heroImage: url })} type="events" label="Image de couverture" />
        <div>
          <label className={labelClass}>Couleur</label>
          <div className="flex gap-2">
            <input type="color" value={form.themeColor} onChange={(e) => setForm({ ...form, themeColor: e.target.value })} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
            <input value={form.themeColor} onChange={(e) => setForm({ ...form, themeColor: e.target.value })} className={`${inputClass} flex-1`} />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <span className="text-xs text-foreground">Publier immédiatement (visible à /series/{form.title ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "..."})</span>
        </label>
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
            {saving ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Création…</> : <><Sparkles className="w-3 h-3" /> Créer le programme</>}
          </button>
          <Link href="/admin/series" className="px-4 py-2 text-xs text-text-secondary hover:text-foreground font-medium transition-colors">Annuler</Link>
        </div>
      </form>
    </div>
  );
}
