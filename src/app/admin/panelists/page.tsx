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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Panelists / Speakers</h1>
          <p className="text-gray-500">{panelists.length} speakers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Speaker</>}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-secondary mb-4">New Speaker</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="First Name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" />
            <input required placeholder="Last Name *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" />
            <input required type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" />
            <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" />
            <input placeholder="Job Title" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" />
            <input placeholder="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" />
            <input placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" />
            <input placeholder="Twitter URL" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none" />
            <select required value={form.eventId} onChange={(e) => setForm({ ...form, eventId: e.target.value })} className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
              <option value="">Select Event *</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
          <textarea required placeholder="Bio *" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full mt-4 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none" rows={3} />
          <button type="submit" className="mt-4 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition">
            Add Speaker
          </button>
        </form>
      )}

      {/* Panelists Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : panelists.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No speakers yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {panelists.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm p-6 group relative">
              <button
                onClick={() => remove(p.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-3">
                <span className="text-white font-bold">{p.firstName[0]}{p.lastName[0]}</span>
              </div>
              <h3 className="font-bold text-secondary">{p.firstName} {p.lastName}</h3>
              {p.jobTitle && <p className="text-primary text-sm">{p.jobTitle}</p>}
              {p.company && <p className="text-gray-500 text-sm">{p.company}</p>}
              {p.topic && (
                <div className="mt-2 bg-primary/5 rounded-lg px-3 py-1.5">
                  <p className="text-xs text-secondary font-medium">{p.topic}</p>
                </div>
              )}
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">{p.bio}</p>
              <p className="text-xs text-gray-400 mt-2">{p.event.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
