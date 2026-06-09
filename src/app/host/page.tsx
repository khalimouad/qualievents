"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";

const EVENT_TYPES = [
  "Conférence",
  "Séminaire / Formation",
  "Forum / Salon",
  "Atelier",
  "Networking",
  "Webinaire",
  "Industriel",
  "Management",
  "Relation clients",
  "Autre",
];

export default function HostRequestPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    eventType: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/host-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl outline-none text-sm transition-all focus:ring-2 border";
  const inputStyle = {
    background: "var(--background)",
    borderColor: "var(--border)",
    color: "var(--foreground)",
  };
  const focusRingStyle = { "--tw-ring-color": "var(--primary)" } as React.CSSProperties;

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16" style={{ background: "var(--bg-subtle)" }}>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--muted)" }}
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>

          {success ? (
            <div className="rounded-2xl p-10 text-center border" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black mb-2" style={{ color: "var(--foreground)" }}>
                Demande envoyée !
              </h2>
              <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
                Notre équipe examinera votre demande et vous contactera sous 48h.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "var(--primary)" }}
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "var(--primary)", boxShadow: "0 8px 24px rgba(255,122,0,0.3)" }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-black mb-2" style={{ color: "var(--foreground)" }}>
                  Organiser un événement
                </h1>
                <p className="text-sm max-w-md mx-auto" style={{ color: "var(--muted)" }}>
                  La plateforme Qualivoire Connect est réservée aux partenaires de Qualivoire. Remplissez ce formulaire et notre équipe reviendra vers vous.
                </p>
              </div>

              <div className="rounded-2xl p-6 sm:p-8 border" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
                {error && (
                  <div
                    className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                        Prénom <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={set("firstName")}
                        required
                        className={inputClass}
                        style={{ ...inputStyle, ...focusRingStyle }}
                        placeholder="Jean"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                        Nom <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={set("lastName")}
                        required
                        className={inputClass}
                        style={{ ...inputStyle, ...focusRingStyle }}
                        placeholder="Kouassi"
                      />
                    </div>
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                        Email <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        required
                        className={inputClass}
                        style={{ ...inputStyle, ...focusRingStyle }}
                        placeholder="jean@entreprise.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                        className={inputClass}
                        style={{ ...inputStyle, ...focusRingStyle }}
                        placeholder="+225 07 00 00 00 00"
                      />
                    </div>
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                      Organisation / Entreprise <span style={{ color: "var(--primary)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.organization}
                      onChange={set("organization")}
                      required
                      className={inputClass}
                      style={{ ...inputStyle, ...focusRingStyle }}
                      placeholder="Qualivoire SARL"
                    />
                  </div>

                  {/* Event type */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                      Type d&apos;événement
                    </label>
                    <select
                      value={form.eventType}
                      onChange={set("eventType")}
                      className={inputClass}
                      style={{ ...inputStyle, ...focusRingStyle }}
                    >
                      <option value="">Sélectionnez un type…</option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                      Message / Contexte
                    </label>
                    <textarea
                      value={form.message}
                      onChange={set("message")}
                      rows={4}
                      className={inputClass}
                      style={{ ...inputStyle, ...focusRingStyle, resize: "none" }}
                      placeholder="Décrivez votre événement, le nombre de participants attendus, la date envisagée…"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98] text-white"
                    style={{ background: "var(--primary)" }}
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi en cours…</>
                    ) : (
                      <><Send className="w-4 h-4" /> Envoyer la demande</>
                    )}
                  </button>

                  <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
                    Notre équipe vous répondra sous 48h ouvrées.
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
