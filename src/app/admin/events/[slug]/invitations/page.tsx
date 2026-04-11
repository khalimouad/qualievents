"use client";

import { useState, useEffect, use } from "react";
import { Send, Plus, X, Mail, MessageSquare, Check, AlertCircle } from "lucide-react";

interface Invitation {
  id: string; email: string; phone: string | null; name: string;
  type: string; status: string; sentAt: string | null; createdAt: string;
}

export default function EventInvitationsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [eventId, setEventId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const load = async () => {
    const ev = await fetch(`/api/events/${slug}`).then((r) => r.json());
    setEventId(ev.id);
    const data = await fetch(`/api/invitations?eventId=${ev.id}`).then((r) => r.json());
    setInvitations(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  const send = async () => {
    if (!bulkText.trim()) return;
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
    if (status === "sent") return <Check className="w-3 h-3 text-success" />;
    if (status === "failed") return <AlertCircle className="w-3 h-3 text-danger" />;
    return <Mail className="w-3 h-3 text-muted" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-muted">{invitations.length} invitations</p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          {showForm ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Send</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
          <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1 block">
            Invitees (one per line: Name, Email, Phone)
          </label>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-xs font-mono resize-none"
            placeholder={"John Doe, john@example.com, +33612345678\nJane Smith, jane@example.com"}
          />
          <button onClick={send} disabled={sending || !bulkText.trim()} className="btn-primary mt-3 px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
            <Send className="w-3 h-3" /> {sending ? "Sending..." : "Send Invitations"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" /></div>
        ) : invitations.length === 0 ? (
          <div className="p-8 text-center">
            <Send className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p className="text-muted text-xs">No invitations sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-medium text-secondary">{inv.name}</td>
                    <td className="px-4 py-2.5 text-xs text-muted">{inv.email}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {statusIcon(inv.status)}
                        <span className="text-[10px] text-muted uppercase tracking-wider">{inv.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-muted hidden lg:table-cell">{inv.sentAt ? new Date(inv.sentAt).toLocaleString() : "—"}</td>
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
