"use client";

import { useState, useEffect, use } from "react";
import { Users, Search, Download, QrCode, Trash2, Upload, FileText } from "lucide-react";
import { AdminGate } from "@/components/AdminGate";
import { t } from "@/lib/i18n";

interface Subscriber {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  status: string;
  createdAt: string;
  badge: { code: string; isScanned: boolean } | null;
}

export default function EventSubscribersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [_eventId, setEventId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const evRes = await fetch(`/api/events/${slug}`);
    const event = await evRes.json();
    setEventId(event.id);
    const res = await fetch(`/api/subscribers?eventId=${event.id}`);
    const data = await res.json();
    setSubscribers(data);
    setLoading(false);
  };

  const [showImport, setShowImport] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);

  const remove = async (id: string) => {
    if (!confirm("Retirer cet abonné ? Son badge sera également supprimé.")) return;
    await fetch(`/api/subscribers?id=${id}`, { method: "DELETE" });
    load();
  };

  const importCsv = async () => {
    if (!csvText.trim() || !_eventId) return;
    setImporting(true);
    const res = await fetch("/api/subscribers/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: _eventId, csv: csvText }),
    });
    const data = await res.json();
    setImportResult(data);
    setImporting(false);
    setCsvText("");
    load();
  };

  useEffect(() => { load(); }, [slug]);

  const filtered = subscribers.filter((s) => {
    const matchSearch = `${s.firstName} ${s.lastName} ${s.email} ${s.company || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const downloadCSV = () => {
    const headers = "First Name,Last Name,Email,Phone,Company,Job Title,Status,Badge Code,Scanned\n";
    const rows = filtered.map((s) =>
      `"${s.firstName}","${s.lastName}","${s.email}","${s.phone || ""}","${s.company || ""}","${s.jobTitle || ""}","${s.status}","${s.badge?.code || ""}","${s.badge?.isScanned ? "Yes" : "No"}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `subscribers-${slug}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-muted">{subscribers.length} au total</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(!showImport)} className={`px-3 py-1.5 text-xs inline-flex items-center gap-1.5 rounded-[10px] border font-medium transition-colors ${showImport ? "bg-subtle text-foreground border-border" : "bg-card text-text-secondary border-border hover:text-foreground"}`}>
            <Upload className="w-3 h-3" /> Importer CSV
          </button>
          <button onClick={downloadCSV} className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
            <Download className="w-3 h-3" /> {t.common.export}
          </button>
        </div>
      </div>

      {showImport && (
        <div className="card p-4 mb-3">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">CSV (Prénom, Nom, Email, Téléphone, Entreprise, Poste)</p>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-subtle border border-border rounded-lg text-xs font-mono resize-none focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            placeholder={"Jean,Dupont,jean@exemple.com,+225070000000,Acme,Directeur\nMarie,Koné,marie@exemple.com"}
          />
          <div className="flex items-center gap-3 mt-2">
            <button onClick={importCsv} disabled={importing || !csvText.trim()} className="btn-primary px-4 py-1.5 text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
              <Upload className="w-3 h-3" /> {importing ? "Import..." : "Importer"}
            </button>
            {importResult && (
              <p className="text-xs text-muted">{importResult.imported} importés, {importResult.skipped} ignorés</p>
            )}
          </div>
        </div>
      )}

      <div className="card p-3 mb-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher nom, email, entreprise..." className="w-full pl-8 pr-3 py-1.5 bg-subtle border border-border rounded-lg focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-subtle border border-border rounded-lg px-2 py-1.5 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs">
          <option value="all">Tous</option>
          <option value="confirmed">Confirmés</option>
          <option value="pending">En attente</option>
          <option value="waitlisted">Liste d&apos;attente</option>
          <option value="cancelled">Annulés</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
            <p className="text-muted text-xs">Aucun abonné pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">{t.register.name}</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">{t.register.email}</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider hidden md:table-cell">{t.register.company}</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Badge</th>
                  <th className="px-4 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-subtle/50 transition-colors group">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                          <span className="text-foreground text-[10px] font-bold">{sub.firstName[0]}{sub.lastName[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium text-secondary text-xs">{sub.firstName} {sub.lastName}</div>
                          {sub.jobTitle && <div className="text-[10px] text-muted">{sub.jobTitle}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted">{sub.email}</td>
                    <td className="px-4 py-2.5 text-xs text-muted hidden md:table-cell">{sub.company || <span className="text-foreground/80">—</span>}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        sub.status === "confirmed" ? "bg-success/10 text-success"
                        : sub.status === "waitlisted" ? "bg-warning/10 text-warning"
                        : sub.status === "pending" ? "bg-warning/10 text-warning"
                        : "bg-danger/10 text-danger"
                      }`}>{sub.status}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {sub.badge ? (
                        <div className="flex items-center gap-1">
                          <QrCode className={`w-3 h-3 ${sub.badge.isScanned ? "text-success" : "text-foreground/80"}`} />
                          <span className="text-[10px] font-mono text-muted">{sub.badge.code}</span>
                        </div>
                      ) : <span className="text-foreground/80 text-[10px]">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <AdminGate>
                        <button onClick={() => remove(sub.id)} className="text-foreground/80 hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </AdminGate>
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
