"use client";

import { useEffect, useState, use, useRef } from "react";
import { FileText, Upload, ArrowUp, ArrowDown, Pencil, Trash2, ExternalLink, Plus, X, Save } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";

interface Doc {
  id: string;
  kind: "PROGRAMME" | "BROCHURE" | "LOGISTICS" | "TERMS" | "OTHER";
  title: string;
  url: string;
  sizeBytes: number | null;
  sortOrder: number;
}

const KINDS: { id: Doc["kind"]; label: string; emoji: string }[] = [
  { id: "PROGRAMME", label: "Programme", emoji: "📅" },
  { id: "BROCHURE", label: "Brochure", emoji: "📕" },
  { id: "LOGISTICS", label: "Logistique / plan d'accès", emoji: "🗺️" },
  { id: "TERMS", label: "Conditions générales", emoji: "📜" },
  { id: "OTHER", label: "Autre", emoji: "📎" },
];
const kindLabel = (k: string) => KINDS.find((x) => x.id === k)?.label || k;
const kindEmoji = (k: string) => KINDS.find((x) => x.id === k)?.emoji || "📎";

const formatSize = (bytes?: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

interface FormState {
  title: string;
  kind: Doc["kind"];
  url: string;
  sizeBytes: number | null;
}

const empty: FormState = { title: "", kind: "PROGRAMME", url: "", sizeBytes: null };

export default function DocumentsAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${slug}/documents`);
      if (!res.ok) throw new Error("Échec du chargement");
      setDocs(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [slug]);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "events");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Échec du téléversement");
      setForm((f) => ({
        ...f,
        url: data.url,
        sizeBytes: file.size,
        title: f.title || file.name.replace(/\.[^.]+$/, ""),
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const startCreate = () => { setEditingId(null); setForm(empty); setShowForm(true); };
  const startEdit = (d: Doc) => {
    setEditingId(d.id);
    setForm({ title: d.title, kind: d.kind, url: d.url, sizeBytes: d.sizeBytes });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(empty); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = editingId
        ? await fetch(`/api/documents/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: form.title, kind: form.kind, url: form.url }),
          })
        : await fetch(`/api/events/${slug}/documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Échec");
      }
      closeForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d: Doc) => {
    if (!confirm(`Supprimer « ${d.title} » ?`)) return;
    const res = await fetch(`/api/documents/${d.id}`, { method: "DELETE" });
    if (!res.ok) {
      const x = await res.json().catch(() => ({}));
      setError(x.error || "Échec");
      return;
    }
    load();
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = docs.findIndex((d) => d.id === id);
    const next = idx + dir;
    if (next < 0 || next >= docs.length) return;
    const reordered = [...docs];
    [reordered[idx], reordered[next]] = [reordered[next], reordered[idx]];
    setDocs(reordered);
    await fetch(`/api/events/${slug}/documents`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((d) => d.id) }),
    });
  };

  const inputClass = "input-base";
  const labelClass = "block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Documents
          </h2>
          <p className="text-text-secondary text-xs mt-0.5">
            PDF de programme, brochure, plan d&apos;accès, conditions générales… Téléversez ou collez un lien.
          </p>
        </div>
        <button
          onClick={() => (showForm ? closeForm() : startCreate())}
          className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
        >
          {showForm ? <><X className="w-3 h-3" /> Annuler</> : <><Plus className="w-3 h-3" /> Ajouter</>}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            {editingId ? "Modifier le document" : "Nouveau document"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Titre *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Programme détaillé QUALI CONNECT 2026" />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Doc["kind"] })} className={inputClass}>
                {KINDS.map((k) => (
                  <option key={k.id} value={k.id}>{k.emoji} {k.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Fichier</label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-subtle border border-border text-text-secondary hover:text-foreground hover:border-primary text-xs font-medium transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? "Téléversement…" : "Téléverser un PDF"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                }}
              />
              <span className="text-[10px] text-text-secondary">— ou collez un lien existant ci-dessous</span>
            </div>
          </div>

          <div>
            <label className={labelClass}>Lien (URL) *</label>
            <input
              required
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className={inputClass}
              placeholder="https://…"
            />
            {form.sizeBytes && (
              <p className="text-[10px] text-text-secondary mt-1">Taille : {formatSize(form.sizeBytes)}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button type="submit" disabled={saving || !form.title || !form.url} className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
              <Save className="w-3 h-3" /> {saving ? "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter"}
            </button>
            <button type="button" onClick={closeForm} className="px-4 py-2 text-xs text-text-secondary hover:text-foreground transition-colors">
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : docs.length === 0 ? (
        <div className="card p-10 text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
          <p className="text-text-secondary text-sm">Aucun document attaché.</p>
          <button onClick={startCreate} className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 mt-3">
            <Plus className="w-3 h-3" /> Ajouter un premier document
          </button>
        </div>
      ) : (
        <ul className="card divide-y divide-border overflow-hidden">
          {docs.map((d, idx) => (
            <li key={d.id} className="p-3 group flex items-start gap-3">
              <div className="flex flex-col gap-0.5 pt-0.5">
                <button onClick={() => move(d.id, -1)} disabled={idx === 0} className="p-0.5 rounded hover:bg-hover text-text-secondary disabled:opacity-30" aria-label="Monter">
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button onClick={() => move(d.id, 1)} disabled={idx === docs.length - 1} className="p-0.5 rounded hover:bg-hover text-text-secondary disabled:opacity-30" aria-label="Descendre">
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
              <span className="text-2xl flex-shrink-0" aria-hidden>{kindEmoji(d.kind)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{d.title}</p>
                <p className="text-[11px] text-text-secondary mt-0.5 flex items-center gap-2">
                  <span>{kindLabel(d.kind)}</span>
                  {d.sizeBytes && <span>· {formatSize(d.sizeBytes)}</span>}
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                    {d.url.replace(/^https?:\/\//, "").slice(0, 50)}
                  </a>
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-primary/10 text-text-secondary hover:text-primary" title="Ouvrir">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => startEdit(d)} className="p-1.5 rounded hover:bg-primary/10 text-text-secondary hover:text-primary" title="Modifier">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <AdminGate>
                  <button onClick={() => remove(d)} className="p-1.5 rounded hover:bg-danger/10 text-text-secondary hover:text-danger" title="Supprimer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </AdminGate>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
