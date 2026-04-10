"use client";

import { useState, useEffect } from "react";
import { Send, Plus, X, Mail, MessageSquare, Check, AlertCircle } from "lucide-react";

interface Invitation {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  type: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  event: { title: string };
}

interface EventOption { id: string; title: string; }

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [eventId, setEventId] = useState("");
  const [bulkText, setBulkText] = useState("");

  const load = () => {
    Promise.all([
      fetch("/api/invitations").then((r) => r.json()),
      fetch("/api/events").then((r) => r.json()),
    ]).then(([inv, ev]) => {
      setInvitations(inv);
      setEvents(ev);
      if (ev.length === 1) setEventId(ev[0].id);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const sendInvitations = async () => {
    if (!eventId || !bulkText.trim()) return;
    setSending(true);

    const lines = bulkText.trim().split("\n").filter(Boolean);
    const invs = lines.map((line) => {
      const parts = line.split(",").map((s) => s.trim());
      return { name: parts[0], email: parts[1], phone: parts[2] || "", type: "email" };
    });

    await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, invitations: invs }),
    });

    setSending(false);
    setShowForm(false);
    setBulkText("");
    load();
  };

  const statusIcon = (status: string) => {
    if (status === "sent") return <Check className="w-4 h-4 text-success" />;
    if (status === "failed") return <AlertCircle className="w-4 h-4 text-danger" />;
    return <Mail className="w-4 h-4 text-muted" />;
  };

  const statusBadge = (status: string) => {
    const base = "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider";
    if (status === "sent") return `${base} bg-success/10 text-success`;
    if (status === "failed") return `${base} bg-danger/10 text-danger`;
    return `${base} bg-gray-100 text-muted`;
  };

  const inputClass = "px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Invitations</h1>
          <p className="text-muted text-sm mt-1">{invitations.length} invitations sent</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm"
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Send Invitations</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-5">Bulk Send Invitations</h2>
          <div className="mb-4">
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">Event</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className={`${inputClass} w-full`}
            >
              <option value="">Select Event</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5 block">
              Invitees (one per line: Name, Email, Phone)
            </label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={6}
              className={`${inputClass} w-full font-mono resize-none`}
              placeholder={"John Doe, john@example.com, +33612345678\nJane Smith, jane@example.com"}
            />
          </div>
          <button
            onClick={sendInvitations}
            disabled={sending || !eventId || !bulkText.trim()}
            className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending..." : "Send Invitations"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-12 text-center">
            <Send className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-muted text-sm">No invitations sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{inv.name[0]}</span>
                        </div>
                        <span className="font-medium text-secondary text-sm">{inv.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{inv.email}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted">
                        {inv.type === "email" ? <Mail className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                        {inv.type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {statusIcon(inv.status)}
                        <span className={statusBadge(inv.status)}>{inv.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted hidden lg:table-cell">
                      {inv.sentAt ? new Date(inv.sentAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
