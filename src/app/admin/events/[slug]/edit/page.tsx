"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

export default function EditEventPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: "", tagline: "", description: "", date: "", endDate: "", venue: "", address: "", city: "", country: "",
    latitude: "", longitude: "", themeColor: "#e94560", maxAttendees: "500", isPublished: false, heroImage: "",
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
          isPublished: data.isPublished || false, heroImage: data.heroImage || "",
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
      router.push(`/admin/events/${slug}`);
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

  const inputClass = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-xs";
  const labelClass = "block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1";

  if (fetching) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <Link href={`/admin/events/${slug}`} className="inline-flex items-center gap-1.5 text-muted hover:text-secondary mb-3 transition-colors text-xs font-medium">
        <ArrowLeft className="w-3 h-3" /> Back to Event
      </Link>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-secondary">Edit Event</h1>
        <p className="text-muted text-xs mt-0.5">Update details for <strong>{form.title}</strong></p>
      </div>

      <form onSubmit={submit} className="max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg mb-3 text-xs font-medium flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />{error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-semibold">Basic Information</h2>
          <div><label className={labelClass}>Event Title <span className="text-primary">*</span></label><input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} required /></div>
          <div><label className={labelClass}>Tagline</label><input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Description <span className="text-primary">*</span></label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} rows={3} required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>Start Date <span className="text-primary">*</span></label><input type="datetime-local" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>End Date</label><input type="datetime-local" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} className={inputClass} /></div>
          </div>
          <ImageUpload value={form.heroImage} onChange={(url) => update("heroImage", url)} type="events" label="Hero Image" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 mt-3">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-semibold">Venue & Location</h2>
          <div><label className={labelClass}>Venue Name <span className="text-primary">*</span></label><input value={form.venue} onChange={(e) => update("venue", e.target.value)} className={inputClass} required /></div>
          <div><label className={labelClass}>Address <span className="text-primary">*</span></label><input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>City <span className="text-primary">*</span></label><input value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Country <span className="text-primary">*</span></label><input value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} required /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>Latitude</label><input value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Longitude</label><input value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className={inputClass} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 mt-3">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-semibold">Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>Max Attendees</label><input type="number" value={form.maxAttendees} onChange={(e) => update("maxAttendees", e.target.value)} className={inputClass} min="1" /></div>
            <div>
              <label className={labelClass}>Theme Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.themeColor} onChange={(e) => update("themeColor", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input value={form.themeColor} onChange={(e) => update("themeColor", e.target.value)} className={`${inputClass} flex-1`} />
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-xs text-secondary">Published</span>
          </label>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button type="button" onClick={deleteEvent} disabled={deleting} className="px-3 py-2 text-xs text-danger hover:bg-danger/5 rounded-lg font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
            <Trash2 className="w-3 h-3" /> {deleting ? "Deleting..." : "Delete"}
          </button>
          <div className="flex items-center gap-2">
            <Link href={`/admin/events/${slug}`} className="px-4 py-2 text-xs text-muted hover:text-secondary font-medium transition-colors">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary px-5 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
              {loading ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-3 h-3" /> Save Changes</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
