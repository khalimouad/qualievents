"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function EditEventPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: "", tagline: "", description: "", date: "", endDate: "", venue: "", address: "", city: "", country: "",
    latitude: "", longitude: "", themeColor: "#e94560", maxAttendees: "500", isPublished: false,
  });

  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError("Event not found"); return; }
        setForm({
          title: data.title || "", tagline: data.tagline || "", description: data.description || "",
          date: data.date ? new Date(data.date).toISOString().slice(0, 16) : "",
          endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : "",
          venue: data.venue || "", address: data.address || "", city: data.city || "", country: data.country || "",
          latitude: data.latitude?.toString() || "", longitude: data.longitude?.toString() || "",
          themeColor: data.themeColor || "#e94560", maxAttendees: data.maxAttendees?.toString() || "500",
          isPublished: data.isPublished || false,
        });
        setFetching(false);
      });
  }, [slug]);

  const update = (field: string, value: string | boolean) => { setForm((f) => ({ ...f, [field]: value })); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/events/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      router.push("/admin");
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update"); }
    finally { setLoading(false); }
  };

  const deleteEvent = async () => {
    if (!confirm("Delete this event? This will remove all subscribers, badges, and data. This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/events/${slug}`, { method: "DELETE" });
      router.push("/admin");
    } catch { setError("Failed to delete"); setDeleting(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  if (fetching) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-muted hover:text-secondary transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        {form.isPublished && (
          <Link href={`/events/${slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-muted hover:text-primary text-xs font-medium transition-colors">
            <ExternalLink className="w-3 h-3" /> View Live Page
          </Link>
        )}
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary">Edit Event</h1>
        <p className="text-muted text-sm mt-1">Update event details for <strong>{form.title}</strong></p>
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
            <input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Tagline</label>
            <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description <span className="text-primary">*</span></label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} rows={4} required />
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
            <input value={form.venue} onChange={(e) => update("venue", e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Address <span className="text-primary">*</span></label>
            <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>City <span className="text-primary">*</span></label><input value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Country <span className="text-primary">*</span></label><input value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} required /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Latitude</label><input value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Longitude</label><input value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className={inputClass} /></div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 p-7 sm:p-8 space-y-6 mt-6">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold">Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Max Attendees</label><input type="number" value={form.maxAttendees} onChange={(e) => update("maxAttendees", e.target.value)} className={inputClass} min="1" /></div>
            <div>
              <label className={labelClass}>Theme Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.themeColor} onChange={(e) => update("themeColor", e.target.value)} className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer" />
                <input value={form.themeColor} onChange={(e) => update("themeColor", e.target.value)} className={`${inputClass} flex-1`} />
              </div>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} className="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary" />
            <div>
              <span className="font-medium text-secondary text-sm">Published</span>
              <p className="text-xs text-muted">Visible on the public events page</p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button type="button" onClick={deleteEvent} disabled={deleting} className="px-5 py-3 text-sm text-danger hover:bg-danger/5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
            <Trash2 className="w-4 h-4" /> {deleting ? "Deleting..." : "Delete Event"}
          </button>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="px-6 py-3 text-sm text-muted hover:text-secondary font-medium transition-colors">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2 disabled:opacity-50">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
