"use client";

import { useState, useEffect, use } from "react";
import { Mail, Plus, X, Send, FileText } from "lucide-react";
import { t } from "@/lib/i18n";

interface Newsletter {
  id: string; subject: string; content: string; status: string;
  sentAt: string | null; createdAt: string;
}

export default function EventNewslettersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [eventId, setEventId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ subject: "", content: "" });

  const load = async () => {
    const ev = await fetch(`/api/events/${slug}`).then((r) => r.json());
    setEventId(ev.id);
    const data = await fetch(`/api/newsletters?eventId=${ev.id}`).then((r) => r.json());
    setNewsletters(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  const submit = async (sendNow: boolean) => {
    if (!form.subject || !form.content) return;
    setSending(true);
    await fetch("/api/newsletters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, eventId, send: sendNow }),
    });
    setSending(false);
    setShowForm(false);
    setForm({ subject: "", content: "" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-muted">{newsletters.length} newsletters</p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          {showForm ? <><X className="w-3 h-3" /> {t.common.cancel}</> : <><Plus className="w-3 h-3" /> Rédiger</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3 space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Objet</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs" placeholder="Ligne d'objet" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">Contenu (HTML)</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs resize-none" placeholder="<p>Contenu de la newsletter...</p>" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => submit(false)} disabled={sending} className="bg-gray-50 hover:bg-gray-100 text-secondary border border-gray-200 px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Brouillon
            </button>
            <button onClick={() => submit(true)} disabled={sending} className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
              <Send className="w-3 h-3" /> {sending ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {loading ? (
          <div className="py-12 text-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" /></div>
        ) : newsletters.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <Mail className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p className="text-muted text-xs">Aucune newsletter pour le moment</p>
          </div>
        ) : (
          newsletters.map((nl) => (
            <div key={nl.id} className="bg-white rounded-xl border border-gray-100 p-3 hover:border-gray-200 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-secondary text-xs truncate">{nl.subject}</h3>
                    <p className="text-muted text-[11px] mt-0.5 line-clamp-1">{nl.content.replace(/<[^>]*>/g, "")}</p>
                  </div>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider flex-shrink-0 ${
                  nl.status === "sent" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>{nl.status}</span>
              </div>
              <p className="text-[10px] text-muted mt-1.5 pl-9">
                {nl.sentAt ? `Sent ${new Date(nl.sentAt).toLocaleString()}` : `Created ${new Date(nl.createdAt).toLocaleString()}`}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
