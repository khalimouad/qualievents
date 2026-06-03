"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

const SUBJECTS = [
  "Information générale",
  "Organiser un événement",
  "Support technique",
  "Partenariat",
];

const inputClass =
  "w-full px-4 py-3 rounded-xl outline-none text-sm transition-all focus:ring-2 border";
const inputStyle: React.CSSProperties = {
  background: "var(--background)",
  borderColor: "var(--border)",
  color: "var(--foreground)",
};

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set =
    (field: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="rounded-2xl p-10 border text-center"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(16,185,129,0.1)" }}
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3
          className="text-xl font-black mb-2"
          style={{ color: "var(--foreground)" }}
        >
          Message envoyé !
        </h3>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Notre équipe vous répondra dans les plus brefs délais.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 sm:p-8 border"
      style={{ background: "var(--background)", borderColor: "var(--border)" }}
    >
      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--muted)" }}
          >
            Nom complet <span style={{ color: "var(--primary)" }}>*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={set("name")}
            required
            className={inputClass}
            style={inputStyle}
            placeholder="Jean Kouassi"
          />
        </div>

        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--muted)" }}
          >
            Adresse email <span style={{ color: "var(--primary)" }}>*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            required
            className={inputClass}
            style={inputStyle}
            placeholder="jean@entreprise.com"
          />
        </div>

        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--muted)" }}
          >
            Sujet <span style={{ color: "var(--primary)" }}>*</span>
          </label>
          <select
            value={form.subject}
            onChange={set("subject")}
            required
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Sélectionnez un sujet…</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--muted)" }}
          >
            Message <span style={{ color: "var(--primary)" }}>*</span>
          </label>
          <textarea
            value={form.message}
            onChange={set("message")}
            required
            rows={5}
            className={inputClass}
            style={{ ...inputStyle, resize: "none" }}
            placeholder="Décrivez votre demande…"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98] text-white"
          style={{ background: "var(--primary)" }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Envoyer le message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
