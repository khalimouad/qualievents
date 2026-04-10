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
    if (status === "sent") return <Check className="w-4 h-4 text-green-500" />;
    if (status === "failed") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Mail className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Invitations</h1>
          <p className="text-gray-500">{invitations.length} invitations sent</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Send Invitations</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-secondary mb-4">Bulk Send Invitations</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
            >
              <option value="">Select Event</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invitees (one per line: Name, Email, Phone)
            </label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none font-mono text-sm resize-none"
              placeholder={"John Doe, john@example.com, +33612345678\nJane Smith, jane@example.com"}
            />
          </div>
          <button
            onClick={sendInvitations}
            disabled={sending || !eventId || !bulkText.trim()}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending..." : "Send Invitations"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : invitations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No invitations sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Type</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-secondary">{inv.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{inv.email}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        {inv.type === "email" ? <Mail className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                        {inv.type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {statusIcon(inv.status)}
                        <span className="text-sm capitalize">{inv.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
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
