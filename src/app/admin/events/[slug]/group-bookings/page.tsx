"use client";

import { useEffect, useState, use } from "react";
import { Building2, FileText, Download, RefreshCw, ExternalLink, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";

interface GroupBooking {
  id: string;
  reference: string;
  payerName: string;
  payerEmail: string;
  companyName: string | null;
  totalAmount: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  invoiceUrl: string | null;
  invoiceNumber: string | null;
  notes: string | null;
  createdAt: string;
  tier: { name: string; price: number; currency: string } | null;
  _count: { subscribers: number };
}

interface BookingDetail extends GroupBooking {
  subscribers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    badge: { code: string; isScanned: boolean } | null;
  }>;
  billingAddress: string | null;
  vatNumber: string | null;
  payerPhone: string | null;
}

const fmt = (cents: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents);

const STATUS_LABEL: Record<GroupBooking["status"], { label: string; tone: string }> = {
  pending: { label: "En attente", tone: "bg-warning/10 text-warning" },
  confirmed: { label: "Confirmée", tone: "bg-success/10 text-success" },
  cancelled: { label: "Annulée", tone: "bg-subtle text-text-secondary" },
  refunded: { label: "Remboursée", tone: "bg-danger/10 text-danger" },
};

export default function GroupBookingsAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [bookings, setBookings] = useState<GroupBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, BookingDetail>>({});
  const [issuing, setIssuing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${slug}/group-bookings`);
      if (!res.ok) throw new Error("Échec du chargement");
      setBookings(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [slug]);

  const expand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!detail[id]) {
      const res = await fetch(`/api/group-bookings/${id}`);
      if (res.ok) {
        const d = await res.json();
        setDetail((m) => ({ ...m, [id]: d }));
      }
    }
  };

  const issueInvoice = async (id: string) => {
    setIssuing(id);
    setError(null);
    try {
      const res = await fetch(`/api/group-bookings/${id}/invoice`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec");
      // Refresh both list and detail
      await load();
      const d = await fetch(`/api/group-bookings/${id}`).then((r) => r.json());
      setDetail((m) => ({ ...m, [id]: d }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setIssuing(null);
    }
  };

  const updateStatus = async (id: string, status: GroupBooking["status"]) => {
    setError(null);
    const res = await fetch(`/api/group-bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec");
      return;
    }
    load();
  };

  const remove = async (b: GroupBooking) => {
    if (!confirm(`Supprimer la réservation ${b.reference} ? Les ${b._count.subscribers} participants seront détachés.`)) return;
    const res = await fetch(`/api/group-bookings/${b.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Échec");
      return;
    }
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Réservations groupées
        </h2>
        <p className="text-text-secondary text-xs mt-0.5">
          Une seule transaction pour plusieurs participants — typique des inscriptions B2B. Émettez la facture en un clic.
        </p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="card p-10 text-center">
          <Building2 className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
          <p className="text-text-secondary text-sm">Aucune réservation groupée.</p>
          <p className="text-text-secondary text-xs mt-1">
            Les inscriptions multi-participants depuis la page publique apparaissent ici.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {bookings.map((b) => (
            <li key={b.id} className="card overflow-hidden">
              <button
                onClick={() => expand(b.id)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-subtle/30 transition-colors"
              >
                <div className="text-text-secondary flex-shrink-0">
                  {expandedId === b.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-[11px] font-mono bg-subtle px-2 py-0.5 rounded">{b.reference}</code>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_LABEL[b.status].tone}`}>
                      {STATUS_LABEL[b.status].label}
                    </span>
                    {b.invoiceNumber && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-primary">
                        <FileText className="w-3 h-3" /> {b.invoiceNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-1 truncate">
                    {b.companyName ? `${b.companyName} — ` : ""}{b.payerName}
                  </p>
                  <p className="text-[11px] text-text-secondary truncate">
                    {b.payerEmail} · {b._count.subscribers} participant{b._count.subscribers > 1 ? "s" : ""}
                    {b.tier ? ` · ${b.tier.name}` : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-primary tabular-nums">{fmt(b.totalAmount, b.currency)}</p>
                  <p className="text-[10px] text-text-secondary">
                    {new Date(b.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </button>

              {expandedId === b.id && detail[b.id] && (
                <div className="border-t border-border bg-subtle/30 p-4 space-y-3">
                  {/* Billing details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {detail[b.id].billingAddress && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold mb-0.5">Adresse de facturation</p>
                        <p className="text-foreground whitespace-pre-line">{detail[b.id].billingAddress}</p>
                      </div>
                    )}
                    {detail[b.id].vatNumber && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold mb-0.5">N° TVA</p>
                        <p className="text-foreground font-mono">{detail[b.id].vatNumber}</p>
                      </div>
                    )}
                    {detail[b.id].payerPhone && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold mb-0.5">Téléphone</p>
                        <p className="text-foreground">{detail[b.id].payerPhone}</p>
                      </div>
                    )}
                    {detail[b.id].notes && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold mb-0.5">Notes</p>
                        <p className="text-foreground whitespace-pre-line">{detail[b.id].notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Attendees */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold mb-2">
                      Participants ({detail[b.id].subscribers.length})
                    </p>
                    <ul className="rounded-lg border border-border bg-card divide-y divide-border">
                      {detail[b.id].subscribers.map((s) => (
                        <li key={s.id} className="px-3 py-2 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-foreground truncate">{s.firstName} {s.lastName}</p>
                            <p className="text-[11px] text-text-secondary truncate">{s.email}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {s.badge?.code && (
                              <code className="text-[10px] font-mono bg-subtle px-1.5 py-0.5 rounded">{s.badge.code.slice(0, 8)}…</code>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${s.status === "confirmed" ? "bg-success/10 text-success" : "bg-subtle text-text-secondary"}`}>
                              {s.status}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => issueInvoice(b.id)}
                      disabled={issuing === b.id}
                      className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <FileText className="w-3 h-3" />
                      {issuing === b.id ? "Génération…" : b.invoiceUrl ? "Régénérer la facture" : "Émettre la facture"}
                    </button>
                    {b.invoiceUrl && (
                      <a href={b.invoiceUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs inline-flex items-center gap-1.5 rounded-full bg-subtle border border-border text-foreground hover:border-primary">
                        <Download className="w-3 h-3" /> Télécharger
                      </a>
                    )}
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value as GroupBooking["status"])}
                      className="input-base text-xs py-1.5 max-w-[180px]"
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="cancelled">Annulée</option>
                      <option value="refunded">Remboursée</option>
                    </select>
                    <AdminGate>
                      <button
                        onClick={() => remove(b)}
                        className="px-3 py-1.5 text-xs inline-flex items-center gap-1.5 rounded-full text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Supprimer
                      </button>
                    </AdminGate>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
