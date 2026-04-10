"use client";

import { useState, useEffect } from "react";
import { Award, Plus, Trash2, X } from "lucide-react";

interface Sponsor { id: string; name: string; logo: string | null; website: string | null; tier: string; event: { title: string } }
interface EventOption { id: string; title: string }

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", logo: "", website: "", tier: "gold", eventId: "" });

  const load = () => {
    Promise.all([
      fetch("/api/sponsors").then((r) => r.json()),
      fetch("/api/events?all=true").then((r) => r.json()),
    ]).then(([s, e]) => { setSponsors(s); setEvents(e); if (e.length === 1) setForm((f) => ({ ...f, eventId: e[0].id })); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/sponsors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false); setForm({ name: "", logo: "", website: "", tier: "gold", eventId: events[0]?.id || "" }); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this sponsor?")) return;
    await fetch(`/api/sponsors?id=${id}`, { method: "DELETE" }); load();
  };

  const inputClass = "px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm";

  const tierColors: Record<string, string> = { platinum: "bg-slate-100 text-slate-700", gold: "bg-amber-50 text-amber-700", silver: "bg-gray-100 text-gray-600", bronze: "bg-orange-50 text-orange-700" };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Sponsors</h1>
          <p className="text-muted text-sm mt-0.5">{sponsors.length} sponsors across all events</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm">
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Sponsor</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-5">New Sponsor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputClass} w-full`} placeholder="TechCorp Global" /></div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Tier</label>
              <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className={`${inputClass} w-full`}>
                <option value="platinum">Platinum</option><option value="gold">Gold</option><option value="silver">Silver</option><option value="bronze">Bronze</option>
              </select>
            </div>
            <div><label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Website</label><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={`${inputClass} w-full`} placeholder="https://example.com" /></div>
            <div><label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Logo URL</label><input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className={`${inputClass} w-full`} placeholder="https://example.com/logo.png" /></div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Event *</label>
              <select required value={form.eventId} onChange={(e) => setForm({ ...form, eventId: e.target.value })} className={`${inputClass} w-full`}>
                <option value="">Select Event</option>{events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary mt-5 px-6 py-2.5 text-sm">Add Sponsor</button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" /></div>
      ) : sponsors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Award className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-muted text-sm">No sponsors yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Sponsor</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Tier</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Event</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Website</th>
                  <th className="px-5 py-3.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sponsors.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-3.5 font-medium text-secondary text-sm">{s.name}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tierColors[s.tier] || tierColors.gold}`}>{s.tier}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted hidden md:table-cell">{s.event.title}</td>
                    <td className="px-5 py-3.5 text-xs text-muted hidden lg:table-cell">{s.website || <span className="text-gray-300">&mdash;</span>}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => remove(s.id)} className="text-gray-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
