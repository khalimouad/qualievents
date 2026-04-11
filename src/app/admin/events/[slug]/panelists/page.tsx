"use client";

import { useState, useEffect, use } from "react";
import { UserCheck, Plus, Trash2, X } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { t } from "@/lib/i18n";

interface Panelist {
  id: string; firstName: string; lastName: string; email: string; bio: string;
  company: string | null; jobTitle: string | null; topic: string | null;
  linkedin: string | null; twitter: string | null; photo: string | null;
}

export default function EventPanelistsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [panelists, setPanelists] = useState<Panelist[]>([]);
  const [eventId, setEventId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", bio: "", company: "", jobTitle: "",
    topic: "", linkedin: "", twitter: "", photo: "",
  });

  const load = async () => {
    const ev = await fetch(`/api/events/${slug}`).then((r) => r.json());
    setEventId(ev.id);
    const data = await fetch(`/api/panelists?eventId=${ev.id}`).then((r) => r.json());
    setPanelists(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/panelists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, eventId }),
    });
    setShowForm(false);
    setForm({ firstName: "", lastName: "", email: "", bio: "", company: "", jobTitle: "", topic: "", linkedin: "", twitter: "", photo: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Retirer ce panéliste ?")) return;
    await fetch(`/api/panelists?id=${id}`, { method: "DELETE" });
    load();
  };

  const inputClass = "px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-xs";
  const labelClass = "text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-muted">{panelists.length} panélistes</p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          {showForm ? <><X className="w-3 h-3" /> {t.common.cancel}</> : <><Plus className="w-3 h-3" /> {t.common.add}</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>{t.register.firstName} *</label><input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={`${inputClass} w-full`} /></div>
            <div><label className={labelClass}>{t.register.lastName} *</label><input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={`${inputClass} w-full`} /></div>
            <div><label className={labelClass}>{t.register.email} *</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputClass} w-full`} /></div>
            <div><label className={labelClass}>{t.register.company}</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={`${inputClass} w-full`} /></div>
            <div><label className={labelClass}>{t.register.jobTitle}</label><input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className={`${inputClass} w-full`} /></div>
            <div><label className={labelClass}>Sujet</label><input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={`${inputClass} w-full`} /></div>
            <div><label className={labelClass}>LinkedIn</label><input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className={`${inputClass} w-full`} /></div>
            <div><label className={labelClass}>Twitter</label><input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className={`${inputClass} w-full`} /></div>
          </div>
          <div className="mt-3"><label className={labelClass}>Biographie *</label><textarea required value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={`${inputClass} w-full resize-none`} rows={2} /></div>
          <div className="mt-3"><ImageUpload value={form.photo} onChange={(url) => setForm({ ...form, photo: url })} type="panelists" label="Photo" /></div>
          <button type="submit" className="btn-primary mt-3 px-4 py-2 text-xs">Ajouter le panéliste</button>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" /></div>
      ) : panelists.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <UserCheck className="w-8 h-8 mx-auto mb-2 text-gray-200" />
          <p className="text-muted text-xs">Aucun panéliste pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {panelists.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 group relative hover:border-gray-200 hover:shadow-sm transition-all">
              <button onClick={() => remove(p.id)} className="absolute top-3 right-3 text-gray-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
              <div className="flex items-start gap-2">
                {p.photo ? (
                  <img src={p.photo} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{p.firstName[0]}{p.lastName[0]}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-secondary text-sm truncate">{p.firstName} {p.lastName}</h3>
                  {p.jobTitle && <p className="text-primary text-[11px] truncate">{p.jobTitle}</p>}
                  {p.company && <p className="text-muted text-[11px] truncate">{p.company}</p>}
                </div>
              </div>
              {p.topic && (
                <div className="mt-2 bg-primary/5 rounded-md px-2 py-1">
                  <p className="text-[10px] text-secondary font-medium truncate">{p.topic}</p>
                </div>
              )}
              <p className="text-muted text-[11px] mt-2 line-clamp-2">{p.bio}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
