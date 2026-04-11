"use client";

import { useState, useEffect, use } from "react";
import { Users, Search, Download, QrCode, Filter, Trash2 } from "lucide-react";

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
  const [eventId, setEventId] = useState<string>("");
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

  const remove = async (id: string) => {
    if (!confirm("Remove this subscriber? Their badge will also be deleted.")) return;
    await fetch(`/api/subscribers?id=${id}`, { method: "DELETE" });
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
        <p className="text-xs text-muted">{subscribers.length} total</p>
        <button onClick={downloadCSV} className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, company..." className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-xs">
          <option value="all">All</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="waitlisted">Waitlisted</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p className="text-muted text-xs">No subscribers yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Company</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted uppercase tracking-wider">Badge</th>
                  <th className="px-4 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[9px] font-bold">{sub.firstName[0]}{sub.lastName[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium text-secondary text-xs">{sub.firstName} {sub.lastName}</div>
                          {sub.jobTitle && <div className="text-[10px] text-muted">{sub.jobTitle}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted">{sub.email}</td>
                    <td className="px-4 py-2.5 text-xs text-muted hidden md:table-cell">{sub.company || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                        sub.status === "confirmed" ? "bg-success/10 text-success"
                        : sub.status === "waitlisted" ? "bg-warning/10 text-warning"
                        : sub.status === "pending" ? "bg-warning/10 text-warning"
                        : "bg-danger/10 text-danger"
                      }`}>{sub.status}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {sub.badge ? (
                        <div className="flex items-center gap-1">
                          <QrCode className={`w-3 h-3 ${sub.badge.isScanned ? "text-success" : "text-gray-300"}`} />
                          <span className="text-[10px] font-mono text-muted">{sub.badge.code}</span>
                        </div>
                      ) : <span className="text-gray-300 text-[10px]">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => remove(sub.id)} className="text-gray-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
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
