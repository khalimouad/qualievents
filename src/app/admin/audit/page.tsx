"use client";

import { useEffect, useMemo, useState } from "react";
import { ScrollText, Search, Filter, X } from "lucide-react";

interface Row {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  resource: string | null;
  metadata: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

const TONES: Array<[RegExp, string]> = [
  [/^auth\./, "bg-primary/10 text-primary"],
  [/^user\./, "bg-success/10 text-success"],
  [/\.delete$/, "bg-danger/10 text-danger"],
  [/payment/, "bg-warning/10 text-warning"],
];
function actionTone(a: string): string {
  for (const [re, c] of TONES) if (re.test(a)) return c;
  return "bg-subtle text-text-secondary";
}

function relTime(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000) return "à l'instant";
  if (d < 3_600_000) return `il y a ${Math.floor(d / 60_000)} min`;
  if (d < 86_400_000) return `il y a ${Math.floor(d / 3_600_000)} h`;
  return new Date(iso).toLocaleString("fr-FR");
}

export default function AuditPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/audit", window.location.origin);
      url.searchParams.set("limit", "200");
      if (actionFilter) url.searchParams.set("action", actionFilter);
      if (actorFilter) url.searchParams.set("actor", actorFilter);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Échec");
      setRows(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of rows) {
      const day = new Date(r.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      if (!m.has(day)) m.set(day, []);
      m.get(day)!.push(r);
    }
    return Array.from(m.entries());
  }, [rows]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-primary" /> Journal d&apos;audit
        </h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Traçabilité des actions d&apos;administration. Conservé en append-only — vous pouvez filtrer mais pas modifier.
        </p>
      </div>

      <section className="card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-text-secondary" />
          <input
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-base max-w-[200px] py-1.5"
            placeholder="Filtrer par action (event.delete…)"
          />
          <input
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="input-base max-w-[220px] py-1.5"
            placeholder="Filtrer par utilisateur"
          />
          <button onClick={load} className="px-3 py-1.5 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/15 transition-colors">
            Appliquer
          </button>
          {(actionFilter || actorFilter) && (
            <button
              onClick={() => { setActionFilter(""); setActorFilter(""); load(); }}
              className="px-3 py-1.5 text-xs text-text-secondary hover:text-foreground inline-flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Réinitialiser
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-3 py-2 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : rows.length === 0 ? (
        <div className="card p-10 text-center">
          <Search className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
          <p className="text-text-secondary text-sm">Aucune entrée pour ce filtre.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <p className="text-[10px] uppercase tracking-[0.15em] text-text-secondary font-semibold mb-2">{day}</p>
              <ul className="card divide-y divide-border overflow-hidden">
                {items.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setOpen(open === r.id ? null : r.id)}
                      className="w-full text-left px-3 py-2.5 hover:bg-subtle/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider flex-shrink-0 ${actionTone(r.action)}`}>
                          {r.action}
                        </span>
                        <div className="flex-1 min-w-0">
                          {r.resource && (
                            <p className="text-sm text-foreground truncate">{r.resource}</p>
                          )}
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            {r.actorEmail || "système"} · {relTime(r.createdAt)}
                            {r.ip && ` · ${r.ip}`}
                          </p>
                        </div>
                      </div>
                      {open === r.id && r.metadata && (
                        <pre className="mt-2 ml-12 p-2 rounded bg-subtle text-[10px] text-text-secondary overflow-auto whitespace-pre-wrap">
                          {(() => {
                            try { return JSON.stringify(JSON.parse(r.metadata), null, 2); }
                            catch { return r.metadata; }
                          })()}
                        </pre>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
