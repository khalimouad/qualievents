"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, User, Briefcase, Calendar, Sparkles, PartyPopper, Clock, Users, Plus, Trash2, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { t } from "@/lib/i18n";

interface Tier {
  id: string;
  name: string;
  price: number;
  currency: string;
  inclusions: string[];
  purchasable: boolean;
}

interface EventInfo {
  id: string;
  slug: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  isPaid: boolean;
  ticketPrice: number | null;
  currency: string;
  ticketTiers?: Tier[];
}

export default function EventRegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const initialTierId = searchParams.get("tier");
  const [step, setStep] = useState(1);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [tierId, setTierId] = useState<string | null>(initialTierId);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", company: "", jobTitle: "", dietaryReqs: "",
  });

  // ── Group-booking mode ───────────────────────────────────────────
  const [groupMode, setGroupMode] = useState(false);
  const [attendees, setAttendees] = useState<Array<{ firstName: string; lastName: string; email: string; phone: string; jobTitle: string }>>([
    { firstName: "", lastName: "", email: "", phone: "", jobTitle: "" },
    { firstName: "", lastName: "", email: "", phone: "", jobTitle: "" },
  ]);
  const [billing, setBilling] = useState({ companyName: "", vatNumber: "", billingAddress: "", notes: "" });
  const [bookingResult, setBookingResult] = useState<{ reference: string; total: number; currency: string; attendeeCount: number; requiresPayment: boolean } | null>(null);

  const addAttendee = () => setAttendees((a) => [...a, { firstName: "", lastName: "", email: "", phone: "", jobTitle: "" }]);
  const removeAttendee = (idx: number) => setAttendees((a) => a.length > 1 ? a.filter((_, i) => i !== idx) : a);
  const updateAttendee = (idx: number, field: string, value: string) =>
    setAttendees((a) => a.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));

  const submitGroup = async () => {
    if (!event) return;
    setError("");
    // Client-side validation
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("Coordonnées du responsable de la réservation requises.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Email du responsable invalide.");
      return;
    }
    const cleaned = attendees.filter((a) => a.firstName.trim() || a.lastName.trim() || a.email.trim());
    if (cleaned.length === 0) {
      setError("Ajoutez au moins un participant.");
      return;
    }
    for (const a of cleaned) {
      if (!a.firstName.trim() || !a.lastName.trim() || !a.email.trim()) {
        setError("Prénom, nom et email obligatoires pour chaque participant.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) {
        setError(`Email invalide : ${a.email}`);
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${slug}/group-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerName: `${form.firstName} ${form.lastName}`.trim(),
          payerEmail: form.email,
          payerPhone: form.phone || null,
          companyName: billing.companyName || form.company || null,
          vatNumber: billing.vatNumber || null,
          billingAddress: billing.billingAddress || null,
          notes: billing.notes || null,
          tierId,
          attendees: cleaned,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la réservation");
      setBookingResult({
        reference: data.reference,
        total: data.totalAmount,
        currency: data.currency,
        attendeeCount: data.attendeeCount,
        requiresPayment: data.requiresPayment,
      });
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${slug}`).then((r) => r.json()),
      fetch(`/api/events/${slug}/tiers`).then((r) => (r.ok ? r.json() : [])),
    ]).then(([ev, tiers]) => {
      setEvent({ ...ev, ticketTiers: tiers });
      // Default to the first purchasable tier if none was passed in the URL
      if (!initialTierId && Array.isArray(tiers)) {
        const first = tiers.find((t: Tier) => t.purchasable);
        if (first) setTierId(first.id);
      }
    });
  }, [slug, initialTierId]);

  const selectedTier = event?.ticketTiers?.find((t) => t.id === tierId) || null;
  const hasTiers = (event?.ticketTiers?.length ?? 0) > 0;

  const updateForm = (field: string, value: string) => { setForm((f) => ({ ...f, [field]: value })); setError(""); };

  const validateStep = () => {
    if (step === 1) {
      if (!form.firstName.trim()) return "Le prénom est obligatoire";
      if (!form.lastName.trim()) return "Le nom est obligatoire";
      if (!form.email.trim()) return "L'email est obligatoire";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Format d'email invalide";
    }
    return "";
  };

  const nextStep = () => { const err = validateStep(); if (err) { setError(err); return; } setStep((s) => s + 1); };

  const submit = async () => {
    if (!event) return;
    if (hasTiers && !tierId) {
      setError("Veuillez choisir un tarif.");
      return;
    }
    setLoading(true); setError("");
    try {
      const isPaidPath = event.isPaid && (selectedTier ? selectedTier.price > 0 : !!event.ticketPrice);
      const payload = { ...form, eventId: event.id, tierId };

      if (isPaidPath) {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Échec d'initialisation du paiement");
        window.location.href = data.paymentUrl;
        return;
      }

      // Free path (free event OR free tier on a paid event)
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'inscription");
      if (data.waitlisted) setWaitlisted(true);
      setSuccess(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Échec de l'inscription"); }
    finally { setLoading(false); }
  };

  // Group booking success — different copy + summary block
  if (success && bookingResult) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-secondary noise-overlay relative pt-16 pb-10">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="relative z-10 max-w-md w-full mx-4 animate-scale-in">
            <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-[24px] shadow-xl p-10 text-center border border-black/5 dark:border-white/10">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center shadow-lg shadow-success/30">
                <Users className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Réservation enregistrée</h1>
              <p className="text-muted mb-4 leading-relaxed">
                {bookingResult.attendeeCount} participant{bookingResult.attendeeCount > 1 ? "s" : ""} inscrit{bookingResult.attendeeCount > 1 ? "s" : ""} à <strong className="text-foreground">{event?.title}</strong>.
              </p>
              <div className="bg-subtle rounded-xl p-4 text-left mb-5">
                <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold mb-1">Référence</p>
                <code className="font-mono text-sm font-bold tracking-widest text-foreground select-all">{bookingResult.reference}</code>
                {bookingResult.total > 0 && (
                  <>
                    <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold mt-3 mb-1">Total</p>
                    <p className="text-xl font-bold text-primary tabular-nums">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: bookingResult.currency, maximumFractionDigits: 0 }).format(bookingResult.total)}
                    </p>
                  </>
                )}
              </div>
              {bookingResult.requiresPayment ? (
                <p className="text-xs text-text-secondary mb-4">
                  L&apos;équipe organisatrice vous fera parvenir la facture à <strong className="text-foreground">{form.email}</strong>. Conservez la référence pour vos échanges.
                </p>
              ) : (
                <p className="text-xs text-text-secondary mb-4">
                  Chaque participant a reçu un email avec son badge.
                </p>
              )}
              <Link href={`/events/${slug}`} className="block w-full bg-black/5 dark:bg-white/5 hover:bg-white/10 text-foreground/80 py-3.5 rounded-[10px] text-sm font-medium transition-colors border border-black/5 dark:border-white/10">
                {t.register.backToEvent}
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-secondary noise-overlay relative pt-16">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="relative z-10 max-w-md w-full mx-4 animate-scale-in">
            <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-[24px] shadow-xl p-10 text-center border border-black/5 dark:border-white/10">
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className={`absolute inset-0 rounded-full ${waitlisted ? "bg-warning/10" : "bg-success/10"} animate-ping`} style={{ animationDuration: "2s" }} />
                <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${waitlisted ? "from-warning to-amber-600 shadow-warning/30" : "from-success to-emerald-600 shadow-success/30"} flex items-center justify-center shadow-lg`}>
                  {waitlisted ? <Clock className="w-10 h-10 text-foreground" /> : <PartyPopper className="w-10 h-10 text-foreground" />}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                {waitlisted ? "Liste d'attente" : t.register.youreIn}
              </h1>
              <p className="text-muted mb-5 leading-relaxed">
                {waitlisted
                  ? <>L&apos;événement <strong className="text-foreground">{event?.title}</strong> est complet. Vous êtes inscrit sur la liste d&apos;attente. Nous vous contacterons si une place se libère.</>
                  : <>{t.register.successMsg} <strong className="text-foreground">{event?.title}</strong>. {t.register.successSub}</>
                }
              </p>
              <div className="space-y-3">
                {!waitlisted && (
                  <Link href={`/events/${slug}/badge`} className="btn-primary w-full py-3.5 text-center block text-sm">{t.nav.getBadge}</Link>
                )}
                <Link href={`/events/${slug}`} className="block w-full bg-black/5 dark:bg-white/5 hover:bg-white/10 text-foreground/80 py-3.5 rounded-[10px] text-sm font-medium transition-colors border border-black/5 dark:border-white/10">{t.register.backToEvent}</Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const steps = [
    { num: 1, label: t.register.stepPersonal, icon: <User className="w-4 h-4" /> },
    { num: 2, label: t.register.stepProfessional, icon: <Briefcase className="w-4 h-4" /> },
    { num: 3, label: t.register.stepConfirm, icon: <Check className="w-4 h-4" /> },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-secondary noise-overlay relative pt-24 pb-16">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          {/* Event context */}
          {event && (
            <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-2xl p-4 mb-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm truncate">{event.title}</p>
                <p className="text-muted text-xs">{new Date(event.date).toLocaleDateString("fr-FR", { month: "long", day: "numeric", year: "numeric" })} &middot; {event.venue}, {event.city}</p>
              </div>
              <Link href={`/events/${slug}`} className="text-muted hover:text-foreground text-xs font-medium flex-shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="text-center mb-6">
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">{t.register.secureSpot}</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-2">{t.register.title}</h1>
          </div>

          {/* Solo / Group toggle */}
          <div className="inline-flex p-1 bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-full border border-black/5 dark:border-white/10 mb-6 mx-auto block w-fit">
            <button
              type="button"
              onClick={() => setGroupMode(false)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors ${!groupMode ? "bg-card text-foreground shadow-sm" : "text-foreground/70 hover:text-foreground"}`}
            >
              <User className="w-3.5 h-3.5" /> Inscription individuelle
            </button>
            <button
              type="button"
              onClick={() => setGroupMode(true)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors ${groupMode ? "bg-card text-foreground shadow-sm" : "text-foreground/70 hover:text-foreground"}`}
            >
              <Users className="w-3.5 h-3.5" /> Réservation groupée
            </button>
          </div>

          {/* GROUP MODE — multi-attendee form */}
          {groupMode ? (
            <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-[24px] shadow-2xl p-7 sm:p-10 border border-black/5 dark:border-white/10">
              {error && (
                <div className="bg-danger/10 border border-danger/30 text-danger px-5 py-3.5 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-danger flex-shrink-0" />{error}
                </div>
              )}

              {/* Tier picker (when applicable) */}
              {hasTiers && (
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Tarif</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {event?.ticketTiers?.filter((t) => t.purchasable).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTierId(t.id)}
                        className={`text-left rounded-xl border p-3 transition-all ${tierId === t.id ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
                      >
                        <p className="font-bold text-foreground text-sm">{t.name}</p>
                        <p className="text-base font-bold text-primary tabular-nums mt-1">
                          {new Intl.NumberFormat("fr-FR", { style: "currency", currency: t.currency, maximumFractionDigits: 0 }).format(t.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Payer */}
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Responsable de la réservation
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input className="input-base" placeholder="Prénom *" value={form.firstName} onChange={(e) => updateForm("firstName", e.target.value)} required />
                <input className="input-base" placeholder="Nom *" value={form.lastName} onChange={(e) => updateForm("lastName", e.target.value)} required />
                <input className="input-base sm:col-span-2" type="email" placeholder="Email *" value={form.email} onChange={(e) => updateForm("email", e.target.value)} required />
                <input className="input-base" placeholder="Téléphone" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
                <input className="input-base" placeholder="Entreprise" value={billing.companyName} onChange={(e) => setBilling({ ...billing, companyName: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <input className="input-base" placeholder="N° de TVA (facultatif)" value={billing.vatNumber} onChange={(e) => setBilling({ ...billing, vatNumber: e.target.value })} />
                <input className="input-base" placeholder="Adresse de facturation" value={billing.billingAddress} onChange={(e) => setBilling({ ...billing, billingAddress: e.target.value })} />
              </div>

              {/* Attendees repeater */}
              <h2 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Participants ({attendees.length})
              </h2>
              <p className="text-xs text-text-secondary mb-3">
                Ajoutez chaque participant. Chacun recevra son propre badge à l&apos;adresse email indiquée.
              </p>

              <ul className="space-y-2 mb-3">
                {attendees.map((a, idx) => (
                  <li key={idx} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">
                        Participant {idx + 1}
                      </span>
                      {attendees.length > 1 && (
                        <button type="button" onClick={() => removeAttendee(idx)} className="p-1 rounded hover:bg-danger/10 text-text-secondary hover:text-danger" aria-label="Retirer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input className="input-base" placeholder="Prénom" value={a.firstName} onChange={(e) => updateAttendee(idx, "firstName", e.target.value)} />
                      <input className="input-base" placeholder="Nom" value={a.lastName} onChange={(e) => updateAttendee(idx, "lastName", e.target.value)} />
                      <input className="input-base" type="email" placeholder="Email" value={a.email} onChange={(e) => updateAttendee(idx, "email", e.target.value)} />
                      <input className="input-base" placeholder="Téléphone (facultatif)" value={a.phone} onChange={(e) => updateAttendee(idx, "phone", e.target.value)} />
                      <input className="input-base sm:col-span-2" placeholder="Poste / fonction (facultatif)" value={a.jobTitle} onChange={(e) => updateAttendee(idx, "jobTitle", e.target.value)} />
                    </div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={addAttendee}
                className="w-full rounded-xl border-2 border-dashed border-border py-3 text-xs font-medium text-text-secondary hover:text-primary hover:border-primary/40 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter un participant
              </button>

              <div className="mt-4">
                <textarea
                  className="input-base resize-none"
                  rows={2}
                  placeholder="Notes / instructions de facturation (facultatif)"
                  value={billing.notes}
                  onChange={(e) => setBilling({ ...billing, notes: e.target.value })}
                />
              </div>

              {/* Total preview */}
              {(selectedTier || event?.ticketPrice) && (
                <div className="mt-5 p-4 rounded-xl bg-subtle flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-secondary">Total estimé</p>
                    <p className="text-[10px] text-text-secondary">
                      {attendees.filter((a) => a.firstName || a.lastName || a.email).length} × {new Intl.NumberFormat("fr-FR", { style: "currency", currency: selectedTier?.currency || event?.currency || "EUR", maximumFractionDigits: 0 }).format(selectedTier?.price || event?.ticketPrice || 0)}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary tabular-nums">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: selectedTier?.currency || event?.currency || "EUR", maximumFractionDigits: 0 }).format(
                      (selectedTier?.price || event?.ticketPrice || 0) *
                        attendees.filter((a) => a.firstName || a.lastName || a.email).length
                    )}
                  </p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={submitGroup}
                  disabled={loading}
                  className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Traitement…</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Réserver pour {attendees.filter((a) => a.firstName || a.lastName || a.email).length || attendees.length} participant{attendees.length > 1 ? "s" : ""}</>
                  )}
                </button>
              </div>
            </div>
          ) : (
          <>
          {/* Steps */}
          <div className="flex items-center justify-center mb-6">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${step > s.num ? "bg-success text-foreground shadow-md shadow-success/20" : step === s.num ? "bg-gradient-to-br from-primary to-primary-dark text-foreground shadow-lg shadow-primary/25" : "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-muted"}`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.icon}
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${step >= s.num ? "text-foreground" : "text-gray-600"}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-10 sm:w-16 h-0.5 mx-2 rounded-full transition-colors duration-500 -mt-5 ${step > s.num ? "bg-success" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-[24px] shadow-2xl p-7 sm:p-10 border border-black/5 dark:border-white/10">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3.5 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{error}
              </div>
            )}

            {step === 1 && (
              <div className="animate-fade-in space-y-4">
                <h2 className="text-xl font-bold text-foreground mb-6">{t.register.personalDetails}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t.register.firstName} <span className="text-primary">*</span></label>
                    <input type="text" value={form.firstName} onChange={(e) => updateForm("firstName", e.target.value)} className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-foreground placeholder:text-gray-600" placeholder="Jean" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t.register.lastName} <span className="text-primary">*</span></label>
                    <input type="text" value={form.lastName} onChange={(e) => updateForm("lastName", e.target.value)} className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-foreground placeholder:text-gray-600" placeholder="Dupont" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t.register.email} <span className="text-primary">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-foreground placeholder:text-gray-600" placeholder="jean@exemple.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t.register.phone}</label>
                  <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-foreground placeholder:text-gray-600" placeholder="+33 6 12 34 56 78" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-4">
                <h2 className="text-xl font-bold text-foreground mb-6">{t.register.professionalInfo}</h2>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t.register.company}</label>
                  <input type="text" value={form.company} onChange={(e) => updateForm("company", e.target.value)} className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-foreground placeholder:text-gray-600" placeholder="Acme SARL" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t.register.jobTitle}</label>
                  <input type="text" value={form.jobTitle} onChange={(e) => updateForm("jobTitle", e.target.value)} className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-foreground placeholder:text-gray-600" placeholder="Ingénieur" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{t.register.dietaryReqs}</label>
                  <textarea value={form.dietaryReqs} onChange={(e) => updateForm("dietaryReqs", e.target.value)} className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-foreground placeholder:text-gray-600 resize-none" rows={2} placeholder={t.register.dietaryPlaceholder} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-foreground mb-6">{t.register.reviewConfirm}</h2>
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-5 border border-black/5 dark:border-white/10">
                  <div className="space-y-2.5">
                    {[
                      { label: t.register.name, value: `${form.firstName} ${form.lastName}` },
                      { label: t.register.email, value: form.email },
                      ...(form.phone ? [{ label: t.register.phone, value: form.phone }] : []),
                      ...(form.company ? [{ label: t.register.company, value: form.company }] : []),
                      ...(form.jobTitle ? [{ label: t.register.role, value: form.jobTitle }] : []),
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-muted">{item.label}</span>
                        <span className="font-medium text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-black/5 dark:border-white/10">
              {step > 1 ? (
                <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-2 text-muted hover:text-foreground font-medium transition-colors text-sm"><ArrowLeft className="w-4 h-4" /> {t.common.back}</button>
              ) : (
                <Link href={`/events/${slug}`} className="flex items-center gap-2 text-muted hover:text-foreground font-medium transition-colors text-sm"><ArrowLeft className="w-4 h-4" /> {t.register.eventCtx}</Link>
              )}
              {step < 3 ? (
                <button onClick={nextStep} className="btn-primary px-7 py-3 text-sm inline-flex items-center gap-2">{t.common.continue} <ArrowRight className="w-4 h-4" /></button>
              ) : (
                <button onClick={submit} disabled={loading} className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2 disabled:opacity-50">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.register.processing}</> : <><Sparkles className="w-4 h-4" /> {t.register.complete}</>}
                </button>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </>
  );
}
