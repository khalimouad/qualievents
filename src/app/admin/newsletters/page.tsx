"use client";

import { useState, useEffect } from "react";
import { Mail, Plus, X, Send, FileText } from "lucide-react";

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  event: { title: string };
}

interface EventOption { id: string; title: string; }

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ subject: "", content: "", eventId: "", send: false });

  const load = () => {
    Promise.all([
      fetch("/api/newsletters").then((r) => r.json()),
      fetch("/api/events").then((r) => r.json()),
    ]).then(([n, e]) => {
      setNewsletters(n);
      setEvents(e);
      if (e.length === 1) setForm((f) => ({ ...f, eventId: e[0].id }));
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const submit = async (sendNow: boolean) => {
    if (!form.subject || !form.content || !form.eventId) return;
    setSending(true);
    await fetch("/api/newsletters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, send: sendNow }),
    });
    setSending(false);
    setShowForm(false);
    setForm({ subject: "", content: "", eventId: events[0]?.id || "", send: false });
    load();
  };

  const inputClass = "px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Newsletters</h1>
          <p className="text-muted text-sm mt-1">{newsletters.length} newsletters</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm"
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Newsletter</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-5">Create Newsletter</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Event</label>
              <select
                value={form.eventId}
                onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                className={`${inputClass} w-full`}
              >
                <option value="">Select Event</option>
                {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Subject</label>
              <input
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Content</label>
              <textarea
                placeholder="Newsletter content (HTML supported)"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={8}
                className={`${inputClass} w-full resize-none`}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => submit(false)}
                disabled={sending}
                className="bg-gray-50 hover:bg-gray-100 text-secondary border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Save as Draft
              </button>
              <button
                onClick={() => submit(true)}
                disabled={sending}
                className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : newsletters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Mail className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-muted text-sm">No newsletters yet</p>
          </div>
        ) : (
          newsletters.map((nl) => (
            <div key={nl.id} className="bg-white rounded-2xl border border-gray-100 p-6 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-secondary">{nl.subject}</h3>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mt-1">{nl.event.title}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  nl.status === "sent" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  {nl.status}
                </span>
              </div>
              <p className="text-muted text-sm mt-3 line-clamp-2 pl-11">{nl.content.replace(/<[^>]*>/g, "")}</p>
              <p className="text-[10px] text-muted tracking-wider mt-2 pl-11">
                {nl.sentAt
                  ? `Sent: ${new Date(nl.sentAt).toLocaleString()}`
                  : `Created: ${new Date(nl.createdAt).toLocaleString()}`}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
