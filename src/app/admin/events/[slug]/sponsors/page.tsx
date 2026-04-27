"use client";

import { useState, useEffect, use } from "react";
import { Award, Plus, Trash2, X, Pencil } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { t } from "@/lib/i18n";

interface Sponsor { id: string; name: string; logo: string | null; website: string | null; tier: string }

const emptyForm = { name: "", logo: "", website: "", tier: "gold" };

export default function EventSponsorsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [eventId, setEventId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const ev = await fetch(`/api/events/${slug}`).then((r) => r.json());
    setEventId(ev.id);
    const data = await fetch(`/api/sponsors?eventId=${ev.id}`).then((r) => r.json());
    setSponsors(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (s: Sponsor) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      logo: s.logo || "",
      website: s.website || "",
      tier: s.tier,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/sponsors/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, eventId }),
      });
    }
    closeForm();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Retirer ce sponsor ?")) return;
    await fetch(`/api/sponsors?id=${id}`, { method: "DELETE" });
    load();
  };

  const inputClass = "px-3 py-2 bg-subtle border border-border rounded-lg focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-xs";
  const labelClass = "text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block";
  const tierColors: Record<string, string> = { platinum: "bg-slate-100 text-slate-700", gold: "bg-amber-50 text-amber-700", silver: "bg-subtle text-text-secondary", bronze: "bg-orange-50 text-orange-700" };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-muted">{sponsors.length} sponsors</p>
        <button onClick={() => showForm ? closeForm() : startCreate()} className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          {showForm ? <><X className="w-3 h-3" /> {t.common.cancel}</> : <><Plus className="w-3 h-3" /> {t.common.add}</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card p-4 mb-3">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {editingId ? "Modifier le sponsor" : "Ajouter un sponsor"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>Nom *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputClass} w-full`} /></div>
            <div>
              <label className={labelClass}>Niveau</label>
              <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className={`${inputClass} w-full`}>
                <option value="platinum">Platine</option><option value="gold">Or</option><option value="silver">Argent</option><option value="bronze">Bronze</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className={labelClass}>Site web</label><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={`${inputClass} w-full`} placeholder="https://exemple.com" /></div>
          </div>
          <div className="mt-3"><ImageUpload value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} type="sponsors" label="Logo" /></div>
          <div className="flex items-center gap-2 mt-3">
            <button type="submit" className="btn-primary px-4 py-2 text-xs">
              {editingId ? "Enregistrer" : "Ajouter le sponsor"}
            </button>
            <button type="button" onClick={closeForm} className="px-4 py-2 text-xs text-text-secondary hover:text-foreground transition-colors">
              {t.common.cancel}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" /></div>
      ) : sponsors.length === 0 ? (
        <div className="card p-5 text-center">
          <Award className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
          <p className="text-muted text-xs">Aucun sponsor pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sponsors.map((s) => (
            <div key={s.id} className={`card p-3 group relative transition-all ${editingId === s.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40"}`}>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(s)} className="p-1 rounded hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors" title="Modifier">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => remove(s.id)} className="p-1 rounded hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors" title="Supprimer">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="h-12 flex items-center justify-center mb-2">
                {s.logo ? <img src={s.logo} alt={s.name} className="max-h-12 max-w-full object-contain" /> : <Award className="w-6 h-6 text-text-secondary" />}
              </div>
              <p className="text-xs font-bold text-foreground truncate">{s.name}</p>
              <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tierColors[s.tier] || tierColors.gold}`}>{s.tier}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
