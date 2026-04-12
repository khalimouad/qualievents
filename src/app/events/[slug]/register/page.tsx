"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, User, Briefcase, Calendar, Sparkles, PartyPopper, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { t } from "@/lib/i18n";

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
}

export default function EventRegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState(1);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", company: "", jobTitle: "", dietaryReqs: "",
  });

  useEffect(() => {
    fetch(`/api/events/${slug}`).then((r) => r.json()).then(setEvent);
  }, [slug]);

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
    setLoading(true); setError("");
    try {
      // Paid event: redirect to CinetPay
      if (event.isPaid && event.ticketPrice) {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, eventId: event.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Échec d'initialisation du paiement");
        // Redirect to CinetPay payment page
        window.location.href = data.paymentUrl;
        return;
      }

      // Free event: direct registration
      const res = await fetch("/api/subscribers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, eventId: event.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'inscription");
      if (data.waitlisted) setWaitlisted(true);
      setSuccess(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Échec de l'inscription"); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-secondary noise-overlay relative pt-16">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="relative z-10 max-w-md w-full mx-4 animate-scale-in">
            <div className="bg-white/5 backdrop-blur-sm rounded-[24px] shadow-xl p-10 text-center border border-white/10">
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className={`absolute inset-0 rounded-full ${waitlisted ? "bg-warning/10" : "bg-success/10"} animate-ping`} style={{ animationDuration: "2s" }} />
                <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${waitlisted ? "from-warning to-amber-600 shadow-warning/30" : "from-success to-emerald-600 shadow-success/30"} flex items-center justify-center shadow-lg`}>
                  {waitlisted ? <Clock className="w-10 h-10 text-white" /> : <PartyPopper className="w-10 h-10 text-white" />}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                {waitlisted ? "Liste d'attente" : t.register.youreIn}
              </h1>
              <p className="text-gray-400 mb-5 leading-relaxed">
                {waitlisted
                  ? <>L&apos;événement <strong className="text-white">{event?.title}</strong> est complet. Vous êtes inscrit sur la liste d&apos;attente. Nous vous contacterons si une place se libère.</>
                  : <>{t.register.successMsg} <strong className="text-white">{event?.title}</strong>. {t.register.successSub}</>
                }
              </p>
              <div className="space-y-3">
                {!waitlisted && (
                  <Link href={`/events/${slug}/badge`} className="btn-primary w-full py-3.5 text-center block text-sm">{t.nav.getBadge}</Link>
                )}
                <Link href={`/events/${slug}`} className="block w-full bg-white/5 hover:bg-white/10 text-gray-300 py-3.5 rounded-[10px] text-sm font-medium transition-colors border border-white/10">{t.register.backToEvent}</Link>
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
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{event.title}</p>
                <p className="text-gray-400 text-xs">{new Date(event.date).toLocaleDateString("fr-FR", { month: "long", day: "numeric", year: "numeric" })} &middot; {event.venue}, {event.city}</p>
              </div>
              <Link href={`/events/${slug}`} className="text-gray-400 hover:text-white text-xs font-medium flex-shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="text-center mb-6">
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">{t.register.secureSpot}</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-2">{t.register.title}</h1>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center mb-6">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${step > s.num ? "bg-success text-white shadow-md shadow-success/20" : step === s.num ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/25" : "bg-white/5 border border-white/10 text-gray-500"}`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.icon}
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${step >= s.num ? "text-white" : "text-gray-600"}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-10 sm:w-16 h-0.5 mx-2 rounded-full transition-colors duration-500 -mt-5 ${step > s.num ? "bg-success" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-[24px] shadow-2xl p-7 sm:p-10 border border-white/10">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3.5 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{error}
              </div>
            )}

            {step === 1 && (
              <div className="animate-fade-in space-y-4">
                <h2 className="text-xl font-bold text-white mb-6">{t.register.personalDetails}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t.register.firstName} <span className="text-primary">*</span></label>
                    <input type="text" value={form.firstName} onChange={(e) => updateForm("firstName", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-white placeholder:text-gray-600" placeholder="Jean" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t.register.lastName} <span className="text-primary">*</span></label>
                    <input type="text" value={form.lastName} onChange={(e) => updateForm("lastName", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-white placeholder:text-gray-600" placeholder="Dupont" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t.register.email} <span className="text-primary">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-white placeholder:text-gray-600" placeholder="jean@exemple.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t.register.phone}</label>
                  <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-white placeholder:text-gray-600" placeholder="+33 6 12 34 56 78" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-4">
                <h2 className="text-xl font-bold text-white mb-6">{t.register.professionalInfo}</h2>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t.register.company}</label>
                  <input type="text" value={form.company} onChange={(e) => updateForm("company", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-white placeholder:text-gray-600" placeholder="Acme SARL" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t.register.jobTitle}</label>
                  <input type="text" value={form.jobTitle} onChange={(e) => updateForm("jobTitle", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-white placeholder:text-gray-600" placeholder="Ingénieur" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t.register.dietaryReqs}</label>
                  <textarea value={form.dietaryReqs} onChange={(e) => updateForm("dietaryReqs", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-white placeholder:text-gray-600 resize-none" rows={2} placeholder={t.register.dietaryPlaceholder} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-6">{t.register.reviewConfirm}</h2>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="space-y-2.5">
                    {[
                      { label: t.register.name, value: `${form.firstName} ${form.lastName}` },
                      { label: t.register.email, value: form.email },
                      ...(form.phone ? [{ label: t.register.phone, value: form.phone }] : []),
                      ...(form.company ? [{ label: t.register.company, value: form.company }] : []),
                      ...(form.jobTitle ? [{ label: t.register.role, value: form.jobTitle }] : []),
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="font-medium text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
              {step > 1 ? (
                <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors text-sm"><ArrowLeft className="w-4 h-4" /> {t.common.back}</button>
              ) : (
                <Link href={`/events/${slug}`} className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors text-sm"><ArrowLeft className="w-4 h-4" /> {t.register.eventCtx}</Link>
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
        </div>
      </div>
    </>
  );
}
