"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { t } from "@/lib/i18n";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", tagline: "", description: "", date: "", endDate: "", venue: "", address: "", city: "", country: "",
    latitude: "", longitude: "", themeColor: "#e94560", maxAttendees: "500", isPublished: false, isPaid: false, ticketPrice: "", heroImage: "",
  });

  const update = (field: string, value: string | boolean) => { setForm((f) => ({ ...f, [field]: value })); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date || !form.venue || !form.address || !form.city || !form.country) {
      setError("Veuillez remplir tous les champs obligatoires"); return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la création");
      router.push(`/admin/events/${data.slug}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Échec de la création"); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-xs";
  const labelClass = "block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1";

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-muted hover:text-secondary mb-3 transition-colors text-xs font-medium">
        <ArrowLeft className="w-3 h-3" /> {t.admin.backToDashboard}
      </Link>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-secondary">{t.admin.createEvent}</h1>
        <p className="text-muted text-xs mt-0.5">Remplissez les détails pour créer une nouvelle page d&apos;événement</p>
      </div>

      <form onSubmit={submit} className="max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg mb-3 text-xs font-medium flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />{error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-semibold">{t.admin.basicInfo}</h2>
          <div>
            <label className={labelClass}>{t.admin.title} <span className="text-primary">*</span></label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} placeholder="Ex : QualiEvents Summit 2026" required />
          </div>
          <div>
            <label className={labelClass}>{t.admin.tagline}</label>
            <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} className={inputClass} placeholder="Ex : Là où l'innovation rencontre l'opportunité" />
          </div>
          <div>
            <label className={labelClass}>{t.admin.description} <span className="text-primary">*</span></label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Décrivez votre événement..." required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t.admin.startDate} <span className="text-primary">*</span></label>
              <input type="datetime-local" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>{t.admin.endDate}</label>
              <input type="datetime-local" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} className={inputClass} />
            </div>
          </div>
          <ImageUpload value={form.heroImage} onChange={(url) => update("heroImage", url)} type="events" label={t.admin.heroImage} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 mt-3">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-semibold">{t.admin.venueAndLocation}</h2>
          <div>
            <label className={labelClass}>{t.admin.venueName} <span className="text-primary">*</span></label>
            <input value={form.venue} onChange={(e) => update("venue", e.target.value)} className={inputClass} placeholder="Palais des Congrès" required />
          </div>
          <div>
            <label className={labelClass}>{t.admin.address} <span className="text-primary">*</span></label>
            <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} placeholder="2 Place de la Porte Maillot" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>{t.admin.city} <span className="text-primary">*</span></label><input value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} placeholder="Paris" required /></div>
            <div><label className={labelClass}>{t.admin.country} <span className="text-primary">*</span></label><input value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} placeholder="France" required /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>{t.admin.latitude}</label><input value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className={inputClass} placeholder="48.8789" /></div>
            <div><label className={labelClass}>{t.admin.longitude}</label><input value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className={inputClass} placeholder="2.2830" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 mt-3">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-semibold">{t.admin.settings}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t.admin.maxAttendees}</label>
              <input type="number" value={form.maxAttendees} onChange={(e) => update("maxAttendees", e.target.value)} className={inputClass} min="1" />
            </div>
            <div>
              <label className={labelClass}>{t.admin.themeColor}</label>
              <div className="flex gap-2">
                <input type="color" value={form.themeColor} onChange={(e) => update("themeColor", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input value={form.themeColor} onChange={(e) => update("themeColor", e.target.value)} className={`${inputClass} flex-1`} />
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-xs text-secondary">{t.admin.publishImmediately}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPaid as boolean} onChange={(e) => update("isPaid", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-xs text-secondary">Événement payant (CinetPay / Orange Money)</span>
          </label>
          {form.isPaid && (
            <div>
              <label className={labelClass}>Prix du billet (XOF / FCFA)</label>
              <input type="number" value={form.ticketPrice} onChange={(e) => update("ticketPrice", e.target.value)} className={inputClass} placeholder="5000" min="100" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <Link href="/admin" className="px-4 py-2 text-xs text-muted hover:text-secondary font-medium transition-colors">{t.common.cancel}</Link>
          <button type="submit" disabled={loading} className="btn-primary px-5 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
            {loading ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.register.processing}</> : <><Sparkles className="w-3 h-3" /> {t.admin.createEvent}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
