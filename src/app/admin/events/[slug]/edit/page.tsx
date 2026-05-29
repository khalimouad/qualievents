"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Copy, Globe, MapPin, Video } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import CountryCitySelect from "@/components/CountryCitySelect";
import { AdminGate } from "@/components/AdminGate";
import { EVENT_TYPES, type EventFormat, type EventType } from "@/lib/eventTypes";
import { t } from "@/lib/i18n";

interface FormState {
  title: string; tagline: string; description: string; date: string; endDate: string;
  eventType: EventType; format: EventFormat;
  objectives: string; targetAudience: string; context: string;
  platform: string; streamUrl: string; streamPassword: string; streamInstructions: string; recordingUrl: string;
  venue: string; address: string; city: string; country: string; latitude: string; longitude: string;
  themeColor: string; maxAttendees: string; isPublished: boolean; isPaid: boolean; ticketPrice: string; heroImage: string; logoUrl: string;
  seriesId: string; brochureUrl: string;
}

interface SeriesOption { id: string; slug: string; title: string }

export default function EditEventPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<FormState>({
    title: "", tagline: "", description: "", date: "", endDate: "",
    eventType: "CONFERENCE", format: "IN_PERSON",
    objectives: "", targetAudience: "", context: "",
    platform: "", streamUrl: "", streamPassword: "", streamInstructions: "", recordingUrl: "",
    venue: "", address: "", city: "", country: "",
    latitude: "", longitude: "",
    themeColor: "#ff7a00", maxAttendees: "500", isPublished: false, isPaid: false, ticketPrice: "",
    heroImage: "", logoUrl: "", seriesId: "", brochureUrl: "",
  });
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([]);

  useEffect(() => {
    fetch("/api/series?all=true").then((r) => r.json()).then(setSeriesList).catch(() => setSeriesList([]));
  }, []);

  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError("Événement introuvable");
          return;
        }
        setForm({
          title: data.title || "",
          tagline: data.tagline || "",
          description: data.description || "",
          date: data.date ? new Date(data.date).toISOString().slice(0, 16) : "",
          endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : "",
          eventType: (data.eventType as EventType) || "CONFERENCE",
          format: (data.format as EventFormat) || "IN_PERSON",
          objectives: data.objectives || "",
          targetAudience: data.targetAudience || "",
          context: data.context || "",
          platform: data.platform || "",
          streamUrl: data.streamUrl || "",
          streamPassword: "", // never re-populated; empty = leave as-is
          streamInstructions: data.streamInstructions || "",
          recordingUrl: data.recordingUrl || "",
          venue: data.venue || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          themeColor: data.themeColor || "#ff7a00",
          maxAttendees: data.maxAttendees?.toString() || "500",
          isPublished: data.isPublished || false,
          isPaid: data.isPaid || false,
          ticketPrice: data.ticketPrice?.toString() || "",
          heroImage: data.heroImage || "",
          logoUrl: data.logoUrl || "",
          seriesId: data.seriesId || "",
          brochureUrl: data.brochureUrl || "",
        });
        setFetching(false);
      });
  }, [slug]);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  };

  const updateLocation = (value: { country: string; city: string; lat?: number; lng?: number }) => {
    setForm((f) => ({
      ...f,
      country: value.country,
      city: value.city,
      latitude: value.lat?.toString() || f.latitude,
      longitude: value.lng?.toString() || f.longitude,
    }));
  };

  const showVenue = form.format !== "ONLINE";
  const showStream = form.format !== "IN_PERSON";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la mise à jour");
      router.push(`/admin/events/${slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async () => {
    if (!confirm("Supprimer cet événement ? Cela supprimera tous les abonnés, badges et données. Cette action est irréversible.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/events/${slug}`, { method: "DELETE" });
      router.push("/admin");
    } catch {
      setError("Échec de la suppression");
      setDeleting(false);
    }
  };

  const cloneEvent = async () => {
    if (!confirm("Dupliquer cet événement ? Programme, tarifs, intervenants, sponsors et documents seront copiés. Les inscrits, badges et paiements ne le seront pas. Les dates seront décalées d'un an.")) return;
    setCloning(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${slug}/clone`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la duplication");
      router.push(`/admin/events/${data.slug}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la duplication");
      setCloning(false);
    }
  };

  const inputClass = "input-base";
  const labelClass = "block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1";
  const cardClass = "card p-4 space-y-3";
  const sectionTitle = "text-[10px] uppercase tracking-[0.15em] text-text-secondary font-semibold";

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Link href={`/admin/events/${slug}`} className="inline-flex items-center gap-1.5 text-text-secondary hover:text-foreground mb-3 transition-colors text-xs font-medium">
        <ArrowLeft className="w-3 h-3" /> {t.register.backToEvent}
      </Link>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">{t.admin.editEvent}</h1>
        <p className="text-text-secondary text-xs mt-0.5">Modifier les détails de <strong>{form.title}</strong></p>
      </div>

      <form onSubmit={submit} className="max-w-3xl space-y-3">
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-danger" />{error}
          </div>
        )}

        {/* TYPE + FORMAT */}
        <div className={cardClass}>
          <h2 className={sectionTitle}>Type et format</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Type</label>
              <select value={form.eventType} onChange={(e) => update("eventType", e.target.value as EventType)} className={inputClass}>
                {EVENT_TYPES.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.emoji} {tp.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Format</label>
              <div className="inline-flex p-0.5 bg-subtle rounded-lg w-full">
                {[
                  { v: "IN_PERSON" as const, label: "Présentiel", Icon: MapPin },
                  { v: "HYBRID" as const, label: "Hybride", Icon: Globe },
                  { v: "ONLINE" as const, label: "En ligne", Icon: Video },
                ].map(({ v, label, Icon }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => update("format", v)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      form.format === v ? "bg-card text-foreground shadow-sm" : "text-text-secondary"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BASIC INFO */}
        <div className={cardClass}>
          <h2 className={sectionTitle}>{t.admin.basicInfo}</h2>
          <div><label className={labelClass}>{t.admin.title} <span className="text-primary">*</span></label><input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} required /></div>
          <div><label className={labelClass}>{t.admin.tagline}</label><input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>{t.admin.description} <span className="text-primary">*</span></label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} className={`${inputClass} resize-none`} rows={3} required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>{t.admin.startDate} <span className="text-primary">*</span></label><input type="datetime-local" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>{t.admin.endDate}</label><input type="datetime-local" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} className={inputClass} /></div>
          </div>
          <ImageUpload value={form.heroImage} onChange={(url) => update("heroImage", url)} type="events" label={t.admin.heroImage} />
          <ImageUpload value={form.logoUrl} onChange={(url) => update("logoUrl", url)} type="events" label="Logo de l'événement (badge PDF)" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Rattacher à un programme</label>
              <select value={form.seriesId} onChange={(e) => update("seriesId", e.target.value)} className={inputClass}>
                <option value="">— aucun —</option>
                {seriesList.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
              <p className="text-[10px] text-text-secondary mt-1">
                Les programmes se créent dans <Link href="/admin/series" className="text-primary hover:underline">Programmes</Link>.
              </p>
            </div>
            <div>
              <label className={labelClass}>Brochure (URL PDF)</label>
              <input value={form.brochureUrl} onChange={(e) => update("brochureUrl", e.target.value)} className={inputClass} placeholder="https://…/brochure.pdf" />
            </div>
          </div>

          <p className="text-[10px] text-text-secondary">La galerie photo et le programme se gèrent dans des onglets dédiés.</p>
        </div>

        {/* RICH CONTENT */}
        <div className={cardClass}>
          <h2 className={sectionTitle}>Programme — détail</h2>
          <div>
            <label className={labelClass}>Contexte et enjeux</label>
            <textarea value={form.context} onChange={(e) => update("context", e.target.value)} className={`${inputClass} resize-none`} rows={3} />
          </div>
          <div>
            <label className={labelClass}>Objectifs</label>
            <textarea value={form.objectives} onChange={(e) => update("objectives", e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Une ligne par objectif." />
          </div>
          <div>
            <label className={labelClass}>Public cible</label>
            <textarea value={form.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} className={`${inputClass} resize-none`} rows={2} />
          </div>
        </div>

        {/* STREAMING */}
        {showStream && (
          <div className={cardClass}>
            <h2 className={sectionTitle}>Visioconférence</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Plateforme</label>
                <input value={form.platform} onChange={(e) => update("platform", e.target.value)} className={inputClass} placeholder="Zoom, Teams…" />
              </div>
              <div>
                <label className={labelClass}>Mot de passe (laisser vide pour ne pas modifier)</label>
                <input
                  type="password"
                  autoComplete="off"
                  value={form.streamPassword}
                  onChange={(e) => update("streamPassword", e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Lien de visioconférence {form.format === "ONLINE" && <span className="text-primary">*</span>}</label>
              <input value={form.streamUrl} onChange={(e) => update("streamUrl", e.target.value)} className={inputClass} placeholder="https://…" required={form.format === "ONLINE"} />
            </div>
            <div>
              <label className={labelClass}>Instructions</label>
              <textarea value={form.streamInstructions} onChange={(e) => update("streamInstructions", e.target.value)} className={`${inputClass} resize-none`} rows={2} />
            </div>
            <div>
              <label className={labelClass}>Lien de l&apos;enregistrement (post-événement)</label>
              <input value={form.recordingUrl} onChange={(e) => update("recordingUrl", e.target.value)} className={inputClass} placeholder="https://…" />
            </div>
          </div>
        )}

        {/* VENUE */}
        {showVenue && (
          <div className={cardClass}>
            <h2 className={sectionTitle}>{t.admin.venueAndLocation}</h2>
            <div><label className={labelClass}>{t.admin.venueName} <span className="text-primary">*</span></label><input value={form.venue} onChange={(e) => update("venue", e.target.value)} className={inputClass} required={showVenue} /></div>
            <div><label className={labelClass}>{t.admin.address} <span className="text-primary">*</span></label><input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} required={showVenue} /></div>
            <CountryCitySelect country={form.country} city={form.city} onChange={updateLocation} />
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.venue + ", " + form.city + ", " + form.country)}`} target="_blank" rel="noopener noreferrer" className="link-spell text-xs text-primary mt-2 inline-block">
              Trouver les coordonnées sur Google Maps →
            </a>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div><label className={labelClass}>{t.admin.latitude}</label><input value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>{t.admin.longitude}</label><input value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className={inputClass} /></div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        <div className={cardClass}>
          <h2 className={sectionTitle}>{t.admin.settings}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>{t.admin.maxAttendees}</label><input type="number" value={form.maxAttendees} onChange={(e) => update("maxAttendees", e.target.value)} className={inputClass} min="1" /></div>
            <div>
              <label className={labelClass}>{t.admin.themeColor}</label>
              <div className="flex gap-2">
                <input type="color" value={form.themeColor} onChange={(e) => update("themeColor", e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <input value={form.themeColor} onChange={(e) => update("themeColor", e.target.value)} className={`${inputClass} flex-1`} />
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs text-foreground">{t.admin.published}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPaid} onChange={(e) => update("isPaid", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs text-foreground">Événement payant (CinetPay / Orange Money)</span>
          </label>
          {form.isPaid && (
            <div>
              <label className={labelClass}>Prix du billet (XOF / FCFA)</label>
              <input type="number" value={form.ticketPrice} onChange={(e) => update("ticketPrice", e.target.value)} className={inputClass} placeholder="5000" min="100" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <AdminGate fallback={<span />}>
            <div className="flex items-center gap-1">
              <button type="button" onClick={deleteEvent} disabled={deleting || cloning} className="px-3 py-2 text-xs text-danger hover:bg-danger/5 rounded-lg font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Trash2 className="w-3 h-3" /> {deleting ? "Suppression..." : t.common.delete}
              </button>
              <button type="button" onClick={cloneEvent} disabled={deleting || cloning} className="px-3 py-2 text-xs text-text-secondary hover:text-foreground hover:bg-hover rounded-lg font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Copy className="w-3 h-3" /> {cloning ? "Duplication..." : "Dupliquer"}
              </button>
            </div>
          </AdminGate>
          <div className="flex items-center gap-2">
            <Link href={`/admin/events/${slug}`} className="px-4 py-2 text-xs text-text-secondary hover:text-foreground font-medium transition-colors">{t.common.cancel}</Link>
            <button type="submit" disabled={loading} className="btn-primary px-5 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
              {loading ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sauvegarde...</> : <><Save className="w-3 h-3" /> {t.common.save}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
