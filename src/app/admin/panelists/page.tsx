"use client";

import { useState, useEffect } from "react";
import { UserCheck, Plus, Trash2, X } from "lucide-react";

interface Panelist {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  company: string | null;
  jobTitle: string | null;
  topic: string | null;
  linkedin: string | null;
  event: { title: string };
}

interface EventOption {
  id: string;
  title: string;
}

export default function PanelistsPage() {
  const [panelists, setPanelists] = useState<Panelist[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", bio: "", company: "",
    jobTitle: "", topic: "", linkedin: "", twitter: "", eventId: "",
  });

  const load = () => {
    Promise.all([
      fetch("/api/panelists").then((r) => r.json()),
      fetch("/api/events").then((r) => r.json()),
    ]).then(([p, e]) => {
      setPanelists(p);
      setEvents(e);
      if (e.length === 1) setForm((f) => ({ ...f, eventId: e[0].id }));
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/panelists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ firstName: "", lastName: "", email: "", bio: "", company: "", jobTitle: "", topic: "", linkedin: "", twitter: "", eventId: events[0]?.id || "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this panelist?")) return;
    await fetch(`/api/panelists?id=${id}`, { method: "DELETE" });
    load();
  };

  const inputClass = "px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Panelists / Speakers</h1>
          <p className="text-muted text-sm mt-1">{panelists.length} speakers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm"
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Speaker</>}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-5">New Speaker</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">First Name *</label>
              <input required placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Last Name *</label>
              <input required placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Email *</label>
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Company</label>
              <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Job Title</label>
              <input placeholder="Job Title" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Topic</label>
              <input placeholder="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">LinkedIn URL</label>
              <input placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Twitter URL</label>
              <input placeholder="Twitter URL" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className={`${inputClass} w-full`} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Event *</label>
              <select required value={form.eventId} onChange={(e) => setForm({ ...form, eventId: e.target.value })} className={`${inputClass} w-full`}>
                <option value="">Select Event</option>
                {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Bio *</label>
            <textarea required placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={`${inputClass} w-full resize-none`} rows={3} />
          </div>
          <button type="submit" className="btn-primary mt-5 px-6 py-2.5 text-sm flex items-center gap-2">
            Add Speaker
          </button>
        </form>
      )}

      {/* Panelists Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : panelists.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <UserCheck className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-muted text-sm">No speakers yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {panelists.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6 group relative card-hover">
              <button
                onClick={() => remove(p.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-3">
                <span className="text-white text-xs font-bold">{p.firstName[0]}{p.lastName[0]}</span>
              </div>
              <h3 className="font-bold text-secondary">{p.firstName} {p.lastName}</h3>
              {p.jobTitle && <p className="text-primary text-sm">{p.jobTitle}</p>}
              {p.company && <p className="text-muted text-sm">{p.company}</p>}
              {p.topic && (
                <div className="mt-2 bg-primary/5 rounded-lg px-3 py-1.5">
                  <p className="text-xs text-secondary font-medium">{p.topic}</p>
                </div>
              )}
              <p className="text-muted text-sm mt-2 line-clamp-2">{p.bio}</p>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mt-3">{p.event.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
