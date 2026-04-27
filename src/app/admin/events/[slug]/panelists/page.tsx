"use client";

import { useState, useEffect, use } from "react";
import { UserCheck, Plus, Trash2, X, Pencil } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { t } from "@/lib/i18n";

interface Panelist {
  id: string; firstName: string; lastName: string; email: string; bio: string;
  company: string | null; jobTitle: string | null; topic: string | null;
  linkedin: string | null; twitter: string | null; photo: string | null;
}

const emptyForm = {
  firstName: "", lastName: "", email: "", bio: "", company: "", jobTitle: "",
  topic: "", linkedin: "", twitter: "", photo: "",
};

export default function EventPanelistsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [panelists, setPanelists] = useState<Panelist[]>([]);
  const [eventId, setEventId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const ev = await fetch(`/api/events/${slug}`).then((r) => r.json());
    setEventId(ev.id);
    const data = await fetch(`/api/panelists?eventId=${ev.id}`).then((r) => r.json());
    setPanelists(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (p: Panelist) => {
    setEditingId(p.id);
    setForm({
      firstName: p.firstName, lastName: p.lastName, email: p.email,
      bio: p.bio, company: p.company || "", jobTitle: p.jobTitle || "",
      topic: p.topic || "", linkedin: p.linkedin || "",
      twitter: p.twitter || "", photo: p.photo || "",
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
      await fetch(`/api/panelists/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/panelists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, eventId }),
      });
    }
    closeForm();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Retirer ce panéliste ?")) return;
    await fetch(`/api/panelists?id=${id}`, { method: "DELETE" });
    load();
  };

  const inputClass = "px-3 py-2 bg-subtle border border-border rounded-lg focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-xs";
  const labelClass = "text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-muted">{panelists.length} panélistes</p>
        <button onClick={() => showForm ? closeForm() : startCreate()} className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          {showForm ? <><X className="w-3 h-3" /> {t.common.cancel}</> : <><Plus className="w-3 h-3" /> {t.common.add}</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card p-4 mb-3">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {editingId ? "Modifier le panéliste" : "Ajouter un panéliste"}
          </h3>
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
          <div className="flex items-center gap-2 mt-3">
            <button type="submit" className="btn-primary px-4 py-2 text-xs">
              {editingId ? "Enregistrer" : "Ajouter le panéliste"}
            </button>
            <button type="button" onClick={closeForm} className="px-4 py-2 text-xs text-text-secondary hover:text-foreground transition-colors">
              {t.common.cancel}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" /></div>
      ) : panelists.length === 0 ? (
        <div className="card p-5 text-center">
          <UserCheck className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
          <p className="text-muted text-xs">Aucun panéliste pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {panelists.map((p) => (
            <div key={p.id} className={`card p-4 group relative transition-all ${editingId === p.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40 hover:shadow-sm"}`}>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(p)} className="p-1 rounded hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors" title="Modifier">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => remove(p.id)} className="p-1 rounded hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors" title="Supprimer">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-start gap-2">
                {p.photo ? (
                  <img src={p.photo} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{p.firstName[0]}{p.lastName[0]}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1 pr-12">
                  <h3 className="font-bold text-foreground text-sm truncate">{p.firstName} {p.lastName}</h3>
                  {p.jobTitle && <p className="text-primary text-[11px] truncate">{p.jobTitle}</p>}
                  {p.company && <p className="text-text-secondary text-[11px] truncate">{p.company}</p>}
                </div>
              </div>
              {p.topic && (
                <div className="mt-2 bg-primary/5 rounded-md px-2 py-1">
                  <p className="text-[10px] text-foreground font-medium truncate">{p.topic}</p>
                </div>
              )}
              <p className="text-text-secondary text-[11px] mt-2 line-clamp-2">{p.bio}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
