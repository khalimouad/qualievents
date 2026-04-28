"use client";

import { useState, useEffect, use, useMemo } from "react";
import { Users, Search, Download, QrCode, Trash2, Upload, Mail, CheckSquare, Square } from "lucide-react";
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

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

  const filtered = useMemo(
    () => subscribers.filter((s) => {
      const matchSearch = `${s.firstName} ${s.lastName} ${s.email} ${s.company || ""}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    }),
    [subscribers, search, statusFilter]
  );

  const filteredIds = useMemo(() => filtered.map((s) => s.id), [filtered]);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      filteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const runBulk = async (
    action: "delete" | "set-status" | "resend-badge",
    extra: { status?: string } = {}
  ) => {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Supprimer ${selected.size} abonné(s) ? Leurs badges seront également supprimés. Action irréversible.`)) return;
    if (action === "resend-badge" && !confirm(`Renvoyer le badge à ${selected.size} abonné(s) ? Seuls les inscrits confirmés recevront un email.`)) return;
    setBulkBusy(true);
    setBulkMessage(null);
    try {
      const res = await fetch("/api/subscribers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'action groupée");
      if (action === "delete") setBulkMessage(`${data.count} abonné(s) supprimé(s)`);
      else if (action === "set-status") setBulkMessage(`${data.count} abonné(s) mis à jour`);
      else setBulkMessage(`${data.sent} email(s) envoyé(s) sur ${data.total}${data.skipped ? ` · ${data.skipped} ignoré(s)` : ""}`);
      clearSelection();
      load();
    } catch (e) {
      setBulkMessage(e instanceof Error ? e.message : "Échec de l'action groupée");
    } finally {
      setBulkBusy(false);
    }
  };

  const exportSelected = () => {
    const rows = (selected.size > 0 ? filtered.filter((s) => selected.has(s.id)) : filtered);
    const headers = "First Name,Last Name,Email,Phone,Company,Job Title,Status,Badge Code,Scanned\n";
    const csv = rows.map((s) =>
      `"${s.firstName}","${s.lastName}","${s.email}","${s.phone || ""}","${s.company || ""}","${s.jobTitle || ""}","${s.status}","${s.badge?.code || ""}","${s.badge?.isScanned ? "Yes" : "No"}"`
    ).join("\n");
    const blob = new Blob([headers + csv], { type: "text/csv" });
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
          <button onClick={exportSelected} className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
            <Download className="w-3 h-3" /> {selected.size > 0 ? `Exporter (${selected.size})` : t.common.export}
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

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="card p-3 mb-3 bg-primary/5 border-primary/30 flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold text-foreground">
            {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            <select
              onChange={(e) => { if (e.target.value) { runBulk("set-status", { status: e.target.value }); e.currentTarget.value = ""; } }}
              disabled={bulkBusy}
              className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs focus:border-primary outline-none disabled:opacity-50"
              defaultValue=""
            >
              <option value="" disabled>Changer statut…</option>
              <option value="confirmed">Confirmer</option>
              <option value="pending">Mettre en attente</option>
              <option value="waitlisted">Liste d&apos;attente</option>
              <option value="cancelled">Annuler</option>
            </select>
            <button
              onClick={() => runBulk("resend-badge")}
              disabled={bulkBusy}
              className="px-3 py-1.5 text-xs inline-flex items-center gap-1.5 rounded-lg bg-card border border-border text-foreground hover:border-primary transition-colors disabled:opacity-50"
            >
              <Mail className="w-3 h-3" /> Renvoyer badge
            </button>
            <AdminGate>
              <button
                onClick={() => runBulk("delete")}
                disabled={bulkBusy}
                className="px-3 py-1.5 text-xs inline-flex items-center gap-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" /> Supprimer
              </button>
            </AdminGate>
            <button onClick={clearSelection} disabled={bulkBusy} className="px-2 py-1.5 text-xs text-text-secondary hover:text-foreground">
              Désélectionner
            </button>
          </div>
        </div>
      )}

      {bulkMessage && (
        <div className="card p-2.5 mb-3 text-xs text-foreground">
          {bulkMessage}{" "}
          <button onClick={() => setBulkMessage(null)} className="text-text-secondary hover:text-foreground ml-2">×</button>
        </div>
      )}

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
                  <th className="px-3 py-2.5 w-8">
                    <button onClick={toggleAll} className="text-text-secondary hover:text-foreground" aria-label={allFilteredSelected ? "Tout désélectionner" : "Tout sélectionner"}>
                      {allFilteredSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">{t.register.name}</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">{t.register.email}</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider hidden md:table-cell">{t.register.company}</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Badge</th>
                  <th className="px-4 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((sub) => {
                  const isSelected = selected.has(sub.id);
                  return (
                    <tr key={sub.id} className={`hover:bg-subtle/50 transition-colors group ${isSelected ? "bg-primary/5" : ""}`}>
                      <td className="px-3 py-2.5">
                        <button onClick={() => toggleOne(sub.id)} className={`${isSelected ? "text-primary" : "text-text-secondary opacity-0 group-hover:opacity-100"} hover:text-foreground transition-all`} aria-label="Sélectionner">
                          {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        </button>
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
