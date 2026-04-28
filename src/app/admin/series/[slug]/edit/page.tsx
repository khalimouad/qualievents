"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, ExternalLink } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { AdminGate } from "@/components/AdminGate";

interface SeriesEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  city: string;
  country: string;
  isPublished: boolean;
}

interface Series {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  heroImage: string | null;
  brochureUrl: string | null;
  themeColor: string | null;
  isPublished: boolean;
  events: SeriesEvent[];
}

export default function EditSeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [series, setSeries] = useState<Series | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", heroImage: "", brochureUrl: "",
    themeColor: "#ff7a00", isPublished: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/series/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setSeries(d);
        setForm({
          title: d.title,
          description: d.description || "",
          heroImage: d.heroImage || "",
          brochureUrl: d.brochureUrl || "",
          themeColor: d.themeColor || "#ff7a00",
          isPublished: d.isPublished,
        });
        setLoading(false);
      });
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/series/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Échec");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Supprimer ce programme ? Les événements rattachés seront détachés (mais conservés).")) return;
    const res = await fetch(`/api/series/${slug}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec");
      return;
    }
    router.push("/admin/series");
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
    <div className="space-y-5 max-w-3xl">
      <Link href="/admin/series" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-foreground text-xs font-medium transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Tous les programmes
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{series?.title}</h1>
          <p className="text-text-secondary text-sm mt-0.5">/series/{series?.slug}</p>
        </div>
        {series?.isPublished && (
          <Link href={`/series/${series.slug}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-primary hover:bg-hover transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Voir
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="card p-5 space-y-4">
        <div>
          <label className={labelClass}>Titre *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} rows={3} />
        </div>
        <ImageUpload value={form.heroImage} onChange={(url) => setForm({ ...form, heroImage: url })} type="events" label="Image de couverture" />
        <div>
          <label className={labelClass}>Brochure (URL PDF)</label>
          <input value={form.brochureUrl} onChange={(e) => setForm({ ...form, brochureUrl: e.target.value })} className={inputClass} placeholder="https://…/brochure.pdf" />
          <p className="text-[10px] text-text-secondary mt-1">Téléversez le PDF dans la galerie ou via un lien externe.</p>
        </div>
        <div>
          <label className={labelClass}>Couleur</label>
          <div className="flex gap-2">
            <input type="color" value={form.themeColor} onChange={(e) => setForm({ ...form, themeColor: e.target.value })} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
            <input value={form.themeColor} onChange={(e) => setForm({ ...form, themeColor: e.target.value })} className={`${inputClass} flex-1`} />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <span className="text-xs text-foreground">Publié</span>
        </label>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <AdminGate>
            <button type="button" onClick={remove} className="px-3 py-2 text-xs text-danger hover:bg-danger/5 rounded-lg font-medium transition-colors flex items-center gap-1.5">
              <Trash2 className="w-3 h-3" /> Supprimer
            </button>
          </AdminGate>
          <div className="flex items-center gap-2">
            <Link href="/admin/series" className="px-4 py-2 text-xs text-text-secondary hover:text-foreground font-medium transition-colors">Annuler</Link>
            <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
              <Save className="w-3 h-3" /> {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>

      {/* List of events in this series — adding/removing is done from the event itself */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-foreground mb-3">Événements de ce programme</h2>
        {(series?.events.length ?? 0) === 0 ? (
          <p className="text-text-secondary text-xs">
            Pour rattacher un événement à ce programme, ouvrez l&apos;événement et choisissez le programme dans
            l&apos;onglet « Modifier ».
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {series?.events.map((e) => (
              <li key={e.id} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/admin/events/${e.slug}`} className="text-sm font-medium text-foreground hover:text-primary truncate block">
                    {e.title}
                  </Link>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {new Date(e.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                    {" · "}
                    {e.city}{e.country ? `, ${e.country}` : ""}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${e.isPublished ? "bg-success/10 text-success" : "bg-subtle text-text-secondary"}`}>
                  {e.isPublished ? "Publié" : "Brouillon"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
