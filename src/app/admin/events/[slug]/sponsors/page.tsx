"use client";

import { useState, useEffect, use } from "react";
import { Award, Plus, Trash2, X } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { t } from "@/lib/i18n";

interface Sponsor { id: string; name: string; logo: string | null; website: string | null; tier: string }

export default function EventSponsorsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [eventId, setEventId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", logo: "", website: "", tier: "gold" });

  const load = async () => {
    const ev = await fetch(`/api/events/${slug}`).then((r) => r.json());
    setEventId(ev.id);
    const data = await fetch(`/api/sponsors?eventId=${ev.id}`).then((r) => r.json());
    setSponsors(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/sponsors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, eventId }),
    });
    setShowForm(false);
    setForm({ name: "", logo: "", website: "", tier: "gold" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Retirer ce sponsor ?")) return;
    await fetch(`/api/sponsors?id=${id}`, { method: "DELETE" });
    load();
  };

  const inputClass = "px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-xs";
  const labelClass = "text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block";
  const tierColors: Record<string, string> = { platinum: "bg-slate-100 text-slate-700", gold: "bg-amber-50 text-amber-700", silver: "bg-gray-100 text-gray-600", bronze: "bg-orange-50 text-orange-700" };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-muted">{sponsors.length} sponsors</p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          {showForm ? <><X className="w-3 h-3" /> {t.common.cancel}</> : <><Plus className="w-3 h-3" /> {t.common.add}</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
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
          <button type="submit" className="btn-primary mt-3 px-4 py-2 text-xs">Ajouter le sponsor</button>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" /></div>
      ) : sponsors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <Award className="w-8 h-8 mx-auto mb-2 text-gray-200" />
          <p className="text-muted text-xs">Aucun sponsor pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sponsors.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-3 group relative hover:border-gray-200 transition-all">
              <button onClick={() => remove(s.id)} className="absolute top-2 right-2 text-gray-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
              <div className="h-12 flex items-center justify-center mb-2">
                {s.logo ? <img src={s.logo} alt={s.name} className="max-h-12 max-w-full object-contain" /> : <Award className="w-6 h-6 text-gray-300" />}
              </div>
              <p className="text-xs font-bold text-secondary truncate">{s.name}</p>
              <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${tierColors[s.tier] || tierColors.gold}`}>{s.tier}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
