"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, User, Briefcase, Calendar, Sparkles, PartyPopper } from "lucide-react";
import Navbar from "@/components/Navbar";

interface EventInfo {
  id: string;
  slug: string;
  title: string;
  date: string;
  venue: string;
  city: string;
}

export default function EventRegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState(1);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
      if (!form.firstName.trim()) return "First name is required";
      if (!form.lastName.trim()) return "Last name is required";
      if (!form.email.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email format";
    }
    return "";
  };

  const nextStep = () => { const err = validateStep(); if (err) { setError(err); return; } setStep((s) => s + 1); };

  const submit = async () => {
    if (!event) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/subscribers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, eventId: event.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Registration failed"); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-background pt-16">
          <div className="max-w-md w-full mx-4 animate-scale-in">
            <div className="bg-white rounded-[24px] shadow-xl p-10 text-center border border-gray-100">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-success/10 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center shadow-lg shadow-success/30">
                  <PartyPopper className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-secondary mb-3">You&apos;re In!</h1>
              <p className="text-muted mb-8 leading-relaxed">Registration successful for <strong>{event?.title}</strong>. Check your email for confirmation.</p>
              <div className="space-y-3">
                <Link href={`/events/${slug}/badge`} className="btn-primary w-full py-3.5 text-center block text-sm">Get Your Badge</Link>
                <Link href={`/events/${slug}`} className="block w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-3.5 rounded-[10px] text-sm font-medium transition-colors">Back to Event</Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const steps = [
    { num: 1, label: "Personal", icon: <User className="w-4 h-4" /> },
    { num: 2, label: "Professional", icon: <Briefcase className="w-4 h-4" /> },
    { num: 3, label: "Confirm", icon: <Check className="w-4 h-4" /> },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          {/* Event context */}
          {event && (
            <div className="glass-card rounded-2xl p-4 mb-8 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-secondary text-sm truncate">{event.title}</p>
                <p className="text-muted text-xs">{new Date(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} &middot; {event.venue}, {event.city}</p>
              </div>
              <Link href={`/events/${slug}`} className="text-muted hover:text-secondary text-xs font-medium flex-shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="text-center mb-10">
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">Secure Your Spot</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary mt-2 mb-2">Register</h1>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center mb-10">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${step > s.num ? "bg-success text-white shadow-md shadow-success/20" : step === s.num ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/25" : "bg-gray-100 text-gray-400"}`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.icon}
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${step >= s.num ? "text-secondary" : "text-gray-400"}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-10 sm:w-16 h-0.5 mx-2 rounded-full transition-colors duration-500 -mt-5 ${step > s.num ? "bg-success" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[24px] shadow-lg p-7 sm:p-10 border border-gray-100">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3.5 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{error}
              </div>
            )}

            {step === 1 && (
              <div className="animate-fade-in space-y-4">
                <h2 className="text-xl font-bold text-secondary mb-6">Personal Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">First Name <span className="text-primary">*</span></label>
                    <input type="text" value={form.firstName} onChange={(e) => updateForm("firstName", e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Last Name <span className="text-primary">*</span></label>
                    <input type="text" value={form.lastName} onChange={(e) => updateForm("lastName", e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email <span className="text-primary">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm" placeholder="+33 6 12 34 56 78" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-4">
                <h2 className="text-xl font-bold text-secondary mb-6">Professional Info</h2>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Company</label>
                  <input type="text" value={form.company} onChange={(e) => updateForm("company", e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm" placeholder="Acme Inc." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Job Title</label>
                  <input type="text" value={form.jobTitle} onChange={(e) => updateForm("jobTitle", e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm" placeholder="Software Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Dietary Requirements</label>
                  <textarea value={form.dietaryReqs} onChange={(e) => updateForm("dietaryReqs", e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm resize-none" rows={2} placeholder="Any allergies or restrictions..." />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-secondary mb-6">Review & Confirm</h2>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="space-y-2.5">
                    {[
                      { label: "Name", value: `${form.firstName} ${form.lastName}` },
                      { label: "Email", value: form.email },
                      ...(form.phone ? [{ label: "Phone", value: form.phone }] : []),
                      ...(form.company ? [{ label: "Company", value: form.company }] : []),
                      ...(form.jobTitle ? [{ label: "Role", value: form.jobTitle }] : []),
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-muted">{item.label}</span>
                        <span className="font-medium text-secondary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-2 text-muted hover:text-secondary font-medium transition-colors text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
              ) : (
                <Link href={`/events/${slug}`} className="flex items-center gap-2 text-muted hover:text-secondary font-medium transition-colors text-sm"><ArrowLeft className="w-4 h-4" /> Event</Link>
              )}
              {step < 3 ? (
                <button onClick={nextStep} className="btn-primary px-7 py-3 text-sm inline-flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>
              ) : (
                <button onClick={submit} disabled={loading} className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2 disabled:opacity-50">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <><Sparkles className="w-4 h-4" /> Complete Registration</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
