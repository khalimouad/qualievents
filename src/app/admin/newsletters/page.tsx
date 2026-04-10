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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Newsletters</h1>
          <p className="text-gray-500">{newsletters.length} newsletters</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Newsletter</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-secondary mb-4">Create Newsletter</h2>
          <div className="space-y-4">
            <select
              value={form.eventId}
              onChange={(e) => setForm({ ...form, eventId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
            >
              <option value="">Select Event</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
            <input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
            />
            <textarea
              placeholder="Newsletter content (HTML supported)"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => submit(false)}
                disabled={sending}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Save as Draft
              </button>
              <button
                onClick={() => submit(true)}
                disabled={sending}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : newsletters.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No newsletters yet</p>
          </div>
        ) : (
          newsletters.map((nl) => (
            <div key={nl.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-secondary">{nl.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">{nl.event.title}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  nl.status === "sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {nl.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-3 line-clamp-2">{nl.content.replace(/<[^>]*>/g, "")}</p>
              <p className="text-xs text-gray-400 mt-2">
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
