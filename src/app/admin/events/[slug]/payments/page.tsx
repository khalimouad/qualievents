"use client";

import { useState, useEffect, use } from "react";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

interface Payment {
  id: string;
  transactionId: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  payerName: string | null;
  payerEmail: string | null;
  payerPhone: string | null;
  createdAt: string;
}

export default function EventPaymentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const ev = await fetch(`/api/events/${slug}`).then((r) => r.json());
      const data = await fetch(`/api/payments?eventId=${ev.id}`).then((r) => r.json());
      setPayments(data);
      setLoading(false);
    })();
  }, [slug]);

  const total = payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const completed = payments.filter((p) => p.status === "completed").length;
  const pending = payments.filter((p) => p.status === "pending").length;

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle className="w-3.5 h-3.5 text-success" />;
    if (status === "failed") return <XCircle className="w-3.5 h-3.5 text-danger" />;
    return <Clock className="w-3.5 h-3.5 text-warning" />;
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " " + currency;
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-lg font-bold text-secondary">{formatAmount(total, "XOF")}</p>
          <p className="text-[10px] text-muted uppercase tracking-wider">Total encaissé</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-lg font-bold text-success">{completed}</p>
          <p className="text-[10px] text-muted uppercase tracking-wider">Confirmés</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-lg font-bold text-warning">{pending}</p>
          <p className="text-[10px] text-muted uppercase tracking-wider">En attente</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" /></div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p className="text-muted text-xs">Aucun paiement pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Payeur</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Montant</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Méthode</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="text-xs font-medium text-secondary">{p.payerName || "—"}</div>
                      <div className="text-[10px] text-muted">{p.payerEmail}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-secondary">{formatAmount(p.amount, p.currency)}</td>
                    <td className="px-4 py-2.5 text-xs text-muted">{p.method || "—"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {statusIcon(p.status)}
                        <span className="text-[10px] text-muted uppercase tracking-wider">{p.status === "completed" ? "Confirmé" : p.status === "pending" ? "En attente" : "Échoué"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-muted hidden lg:table-cell">{new Date(p.createdAt).toLocaleString("fr-FR")}</td>
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
