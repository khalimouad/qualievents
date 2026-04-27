"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Send } from "lucide-react";
import { t } from "@/lib/i18n";

interface InfoRequestFormProps {
  eventId: string;
}

export default function InfoRequestForm({ eventId }: InfoRequestFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/info-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, eventId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t.event.infoRequest.error);
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.event.infoRequest.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="card p-8 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-serif text-2xl font-medium text-foreground mb-2">
          {t.event.infoRequest.success}
        </h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-serif text-xl font-medium text-foreground">
            {t.event.infoRequest.title}
          </h3>
          <p className="text-sm text-text-secondary">{t.event.infoRequest.sub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-1.5 block">
            {t.event.infoRequest.firstName} *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="input-base"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-1.5 block">
            {t.event.infoRequest.lastName} *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="input-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-1.5 block">
            {t.event.infoRequest.email} *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-base"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-1.5 block">
            {t.event.infoRequest.phone}
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input-base"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-1.5 block">
          {t.event.infoRequest.company}
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="input-base"
        />
      </div>

      <div className="mb-6">
        <label className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-1.5 block">
          {t.event.infoRequest.message}
        </label>
        <textarea
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="input-base resize-none"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full py-3.5 text-sm uppercase tracking-wider"
      >
        <Send className="w-4 h-4" />
        {submitting ? t.event.infoRequest.sending : t.event.infoRequest.submit}
      </button>
    </form>
  );
}
