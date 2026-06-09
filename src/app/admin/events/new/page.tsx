"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Globe, MapPin, Video } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import CountryCitySelect from "@/components/CountryCitySelect";
import { EVENT_TYPES, findEventType, type EventFormat, type EventType } from "@/lib/eventTypes";
import { t } from "@/lib/i18n";

interface FormState {
  title: string;
  tagline: string;
  description: string;
  date: string;
  endDate: string;
  // type & format
  eventType: EventType;
  format: EventFormat;
  // rich content
  objectives: string;
  targetAudience: string;
  context: string;
  // streaming
  platform: string;
  streamUrl: string;
  streamPassword: string;
  streamInstructions: string;
  // physical
  venue: string;
  address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  // misc
  themeColor: string;
  maxAttendees: string;
  isPublished: boolean;
  isPaid: boolean;
  ticketPrice: string;
  heroImage: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    title: "", tagline: "", description: "", date: "", endDate: "",
    eventType: "CONFERENCE", format: "IN_PERSON",
    objectives: "", targetAudience: "", context: "",
    platform: "", streamUrl: "", streamPassword: "", streamInstructions: "",
    venue: "", address: "", city: "", country: "",
    latitude: "", longitude: "",
    themeColor: "#ff7a00", maxAttendees: "500", isPublished: false, isPaid: false, ticketPrice: "",
    heroImage: "",
  });

  const preset = findEventType(form.eventType);
  const isOnline = form.format === "ONLINE";
  const showVenue = form.format !== "ONLINE";
  const showStream = form.format !== "IN_PERSON";

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

  const pickType = (id: EventType) => {
    const p = findEventType(id);
    setForm((f) => ({
      ...f,
      eventType: id,
      format: p.defaults.format,
      isPaid: p.defaults.isPaid,
    }));
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date) {
      setError("Le titre, la description et la date de début sont obligatoires.");
      return;
    }
    if (showVenue && (!form.venue || !form.address || !form.city || !form.country)) {
      setError("Lieu, adresse, ville et pays sont obligatoires pour un événement présentiel.");
      return;
    }
    if (showStream && !form.streamUrl) {
      setError("Le lien de visioconférence est obligatoire pour un événement en ligne ou hybride.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la création");
      router.push(`/admin/events/${data.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la création");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input-base";
  const labelClass = "block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1";
  const cardClass = "card p-4 space-y-3";
  const sectionTitle = "text-[10px] uppercase tracking-[0.15em] text-text-secondary font-semibold";

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-foreground mb-3 transition-colors text-xs font-medium">
        <ArrowLeft className="w-3 h-3" /> {t.admin.backToDashboard}
      </Link>

      <div className="mb-4">
        <h1 className="text-2xl font-bold font-serif text-foreground">{t.admin.createEvent}</h1>
        <p className="text-text-secondary text-xs mt-0.5">Choisissez d&apos;abord un type d&apos;événement — les champs suivants s&apos;adaptent.</p>
      </div>

      <form onSubmit={submit} className="max-w-3xl space-y-3">
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-danger" />{error}
          </div>
        )}

        {/* TYPE PICKER */}
        <div className={cardClass}>
          <h2 className={sectionTitle}>Type d&apos;événement</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {EVENT_TYPES.map((tp) => {
              const selected = tp.id === form.eventType;
              return (
                <button
                  key={tp.id}
                  type="button"
                  onClick={() => pickType(tp.id)}
                  className={`text-left rounded-xl border p-3 transition-all ${
                    selected
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="text-2xl mb-1">{tp.emoji}</div>
                  <div className="font-bold text-foreground text-xs">{tp.label}</div>
                  <p className="text-[10px] text-text-secondary mt-1 line-clamp-2 leading-snug">{tp.description}</p>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-text-secondary">{preset.description}</p>
        </div>

        {/* FORMAT TOGGLE */}
        <div className={cardClass}>
          <h2 className={sectionTitle}>Format de diffusion</h2>
          <div className="inline-flex p-0.5 bg-subtle rounded-lg">
            {[
              { v: "IN_PERSON" as const, label: "Présentiel", Icon: MapPin },
              { v: "HYBRID" as const, label: "Hybride", Icon: Globe },
              { v: "ONLINE" as const, label: "En ligne", Icon: Video },
            ].map(({ v, label, Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => update("format", v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  form.format === v ? "bg-card text-foreground shadow-sm" : "text-text-secondary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-text-secondary">
            {form.format === "IN_PERSON" && "L'événement se tient sur place. Une adresse précise est requise."}
            {form.format === "ONLINE" && "L'événement est 100% en ligne. Renseignez le lien de visioconférence — il sera communiqué aux inscrits."}
            {form.format === "HYBRID" && "Mixte : un lieu physique + un lien de visioconférence pour les participants à distance."}
          </p>
        </div>

        {/* BASIC INFO */}
        <div className={cardClass}>
          <h2 className={sectionTitle}>{t.admin.basicInfo}</h2>
          <div>
            <label className={labelClass}>{t.admin.title} <span className="text-primary">*</span></label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} placeholder="Ex : Qualivoire Connect Summit 2026" required />
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
          <p className="text-[10px] text-text-secondary">La galerie photo et le programme se gèrent dans des onglets dédiés après la création.</p>
        </div>

        {/* RICH CONTENT — collapsible by intent based on preset defaults */}
        {(preset.defaults.showObjectives || preset.defaults.showTargetAudience || preset.defaults.showContext) && (
          <div className={cardClass}>
            <h2 className={sectionTitle}>Programme — détail</h2>
            {preset.defaults.showContext && (
              <div>
                <label className={labelClass}>Contexte et enjeux</label>
                <textarea value={form.context} onChange={(e) => update("context", e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Pourquoi cet événement, quels enjeux il adresse." />
              </div>
            )}
            {preset.defaults.showObjectives && (
              <div>
                <label className={labelClass}>Objectifs</label>
                <textarea value={form.objectives} onChange={(e) => update("objectives", e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Une ligne par objectif. Affiché en liste à puces sur la page publique." />
              </div>
            )}
            {preset.defaults.showTargetAudience && (
              <div>
                <label className={labelClass}>Public cible</label>
                <textarea value={form.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Une ligne par profil ciblé." />
              </div>
            )}
          </div>
        )}

        {/* STREAMING */}
        {showStream && (
          <div className={cardClass}>
            <h2 className={sectionTitle}>Visioconférence</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Plateforme</label>
                <input
                  value={form.platform}
                  onChange={(e) => update("platform", e.target.value)}
                  className={inputClass}
                  placeholder="Zoom, Teams, Google Meet, YouTube Live…"
                />
              </div>
              <div>
                <label className={labelClass}>Mot de passe (facultatif)</label>
                <input
                  type="password"
                  autoComplete="off"
                  value={form.streamPassword}
                  onChange={(e) => update("streamPassword", e.target.value)}
                  className={`${inputClass} font-mono`}
                  placeholder="Stocké chiffré"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Lien de visioconférence {isOnline && <span className="text-primary">*</span>}
              </label>
              <input
                value={form.streamUrl}
                onChange={(e) => update("streamUrl", e.target.value)}
                className={inputClass}
                placeholder="https://us02web.zoom.us/j/…"
                required={isOnline}
              />
            </div>
            <div>
              <label className={labelClass}>Instructions de connexion (facultatif)</label>
              <textarea
                value={form.streamInstructions}
                onChange={(e) => update("streamInstructions", e.target.value)}
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Ex : « Le lien est diffusé 1h avant le début. Préparez un casque. »"
              />
            </div>
            <p className="text-[10px] text-text-secondary">
              Le lien est envoyé aux inscrits dans l&apos;email de confirmation. Vous pouvez le mettre à jour à tout moment.
            </p>
          </div>
        )}

        {/* VENUE */}
        {showVenue && (
          <div className={cardClass}>
            <h2 className={sectionTitle}>{t.admin.venueAndLocation}</h2>
            <div>
              <label className={labelClass}>{t.admin.venueName} <span className="text-primary">*</span></label>
              <input value={form.venue} onChange={(e) => update("venue", e.target.value)} className={inputClass} placeholder="Palais des Congrès" required={showVenue} />
            </div>
            <div>
              <label className={labelClass}>{t.admin.address} <span className="text-primary">*</span></label>
              <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} placeholder="2 Place de la Porte Maillot" required={showVenue} />
            </div>
            <CountryCitySelect country={form.country} city={form.city} onChange={updateLocation} />
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.venue + ", " + form.city + ", " + form.country)}`} target="_blank" rel="noopener noreferrer" className="link-spell text-xs text-primary mt-2 inline-block">
              Trouver les coordonnées sur Google Maps →
            </a>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div><label className={labelClass}>{t.admin.latitude}</label><input value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className={inputClass} placeholder="48.8789" /></div>
              <div><label className={labelClass}>{t.admin.longitude}</label><input value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className={inputClass} placeholder="2.2830" /></div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        <div className={cardClass}>
          <h2 className={sectionTitle}>{t.admin.settings}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t.admin.maxAttendees}</label>
              <input type="number" value={form.maxAttendees} onChange={(e) => update("maxAttendees", e.target.value)} className={inputClass} min="1" />
            </div>
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
            <span className="text-xs text-foreground">{t.admin.publishImmediately}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPaid} onChange={(e) => update("isPaid", e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-xs text-foreground">Événement payant (CinetPay / Orange Money)</span>
          </label>
          {form.isPaid && (
            <div>
              <label className={labelClass}>Prix du billet</label>
              <input type="number" value={form.ticketPrice} onChange={(e) => update("ticketPrice", e.target.value)} className={inputClass} placeholder="5000" min="100" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <Link href="/admin" className="px-4 py-2 text-xs text-text-secondary hover:text-foreground font-medium transition-colors">{t.common.cancel}</Link>
          <button type="submit" disabled={loading} className="btn-primary text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
            {loading ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.register.processing}</> : <><Sparkles className="w-3 h-3" /> {t.admin.createEvent}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
