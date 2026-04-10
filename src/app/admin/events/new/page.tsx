"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Check, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", tagline: "", description: "", date: "", endDate: "", venue: "", address: "", city: "", country: "",
    latitude: "", longitude: "", themeColor: "#e94560", maxAttendees: "500", isPublished: false,
  });

  const update = (field: string, value: string | boolean) => { setForm((f) => ({ ...f, [field]: value })); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date || !form.venue || !form.address || !form.city || !form.country) {
      setError("Please fill in all required fields"); return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");
      router.push("/admin");
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to create event"); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-2 text-muted hover:text-secondary mb-6 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary">Create New Event</h1>
        <p className="text-muted text-sm mt-1">Fill in the details to create a new event page</p>
      </div>

      <form onSubmit={submit} className="max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3.5 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />{error}
          </div>
        )}

        <div className="bg-white rounded-[24px] border border-gray-100 p-7 sm:p-8 space-y-6">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold">Basic Information</h2>

          <div>
            <label className={labelClass}>Event Title <span className="text-primary">*</span></label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} placeholder="QualiEvents Summit 2026" required />
          </div>

          <div>
            <label className={labelClass}>Tagline</label>
            <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} className={inputClass} placeholder="Where Innovation Meets Opportunity" />
          </div>

          <div>
            <label className={labelClass}>Description <span className="text-primary">*</span></label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} rows={4} placeholder="Describe your event..." required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date <span className="text-primary">*</span></label>
              <input type="datetime-local" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="datetime-local" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 p-7 sm:p-8 space-y-6 mt-6">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold">Venue & Location</h2>

          <div>
            <label className={labelClass}>Venue Name <span className="text-primary">*</span></label>
            <input value={form.venue} onChange={(e) => update("venue", e.target.value)} className={inputClass} placeholder="Palais des Congres" required />
          </div>

          <div>
            <label className={labelClass}>Address <span className="text-primary">*</span></label>
            <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} placeholder="2 Place de la Porte Maillot" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City <span className="text-primary">*</span></label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} placeholder="Paris" required />
            </div>
            <div>
              <label className={labelClass}>Country <span className="text-primary">*</span></label>
              <input value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} placeholder="France" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Latitude</label>
              <input value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className={inputClass} placeholder="48.8789" />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className={inputClass} placeholder="2.2830" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 p-7 sm:p-8 space-y-6 mt-6">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold">Settings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Max Attendees</label>
              <input type="number" value={form.maxAttendees} onChange={(e) => update("maxAttendees", e.target.value)} className={inputClass} min="1" />
            </div>
            <div>
              <label className={labelClass}>Theme Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.themeColor} onChange={(e) => update("themeColor", e.target.value)} className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer" />
                <input value={form.themeColor} onChange={(e) => update("themeColor", e.target.value)} className={`${inputClass} flex-1`} placeholder="#e94560" />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} className="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary" />
            <div>
              <span className="font-medium text-secondary text-sm">Publish immediately</span>
              <p className="text-xs text-muted">Make this event visible on the public events page</p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8">
          <Link href="/admin" className="px-6 py-3 text-sm text-muted hover:text-secondary font-medium transition-colors">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2 disabled:opacity-50">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : <><Sparkles className="w-4 h-4" /> Create Event</>}
          </button>
        </div>
      </form>
    </div>
  );
}
