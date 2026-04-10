"use client";

import { useState, useEffect } from "react";
import { Users, Search, Download, QrCode, Filter } from "lucide-react";

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
  event: { title: string };
  badge: { code: string; isScanned: boolean } | null;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscribers").then((r) => r.json()).then((data) => { setSubscribers(data); setLoading(false); });
  }, []);

  const filtered = subscribers.filter((s) => {
    const matchesSearch = `${s.firstName} ${s.lastName} ${s.email} ${s.company || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const downloadCSV = () => {
    const headers = "First Name,Last Name,Email,Phone,Company,Job Title,Status,Badge Code,Scanned\n";
    const rows = filtered.map((s) =>
      `"${s.firstName}","${s.lastName}","${s.email}","${s.phone || ""}","${s.company || ""}","${s.jobTitle || ""}","${s.status}","${s.badge?.code || ""}","${s.badge?.isScanned ? "Yes" : "No"}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Subscribers</h1>
          <p className="text-muted text-sm mt-0.5">{subscribers.length} total registered attendees</p>
        </div>
        <button onClick={downloadCSV} className="btn-primary px-5 py-2.5 text-sm inline-flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or company..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm">
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-muted text-sm">No subscribers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Company</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Badge</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">{sub.firstName[0]}{sub.lastName[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium text-secondary text-sm">{sub.firstName} {sub.lastName}</div>
                          {sub.jobTitle && <div className="text-[11px] text-muted">{sub.jobTitle}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted">{sub.email}</td>
                    <td className="px-5 py-3.5 text-sm text-muted hidden md:table-cell">{sub.company || <span className="text-gray-300">&mdash;</span>}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        sub.status === "confirmed" ? "bg-success/10 text-success"
                        : sub.status === "pending" ? "bg-warning/10 text-warning"
                        : "bg-danger/10 text-danger"
                      }`}>
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {sub.badge ? (
                        <div className="flex items-center gap-1.5">
                          <QrCode className={`w-3.5 h-3.5 ${sub.badge.isScanned ? "text-success" : "text-gray-300"}`} />
                          <span className="text-xs font-mono text-muted">{sub.badge.code}</span>
                        </div>
                      ) : <span className="text-gray-300 text-xs">&mdash;</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted hidden lg:table-cell">{new Date(sub.createdAt).toLocaleDateString()}</td>
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
