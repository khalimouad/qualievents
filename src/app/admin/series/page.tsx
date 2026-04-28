"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Layers, ArrowUpRight } from "lucide-react";

interface Series {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  heroImage: string | null;
  themeColor: string | null;
  isPublished: boolean;
  _count: { events: number };
}

export default function SeriesListPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/series?all=true")
      .then((r) => r.json())
      .then((d) => { setSeries(d); setLoading(false); });
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Programmes</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Regroupez plusieurs événements sous un même programme. Idéal pour les tournées (ex&nbsp;: QUALI CONNECT 2026 dans 11 villes).
          </p>
        </div>
        <Link href="/admin/series/new" className="btn-primary px-4 py-2.5 text-xs inline-flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Nouveau programme
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : series.length === 0 ? (
        <div className="card p-10 text-center">
          <Layers className="w-8 h-8 mx-auto mb-2 text-text-secondary opacity-50" />
          <p className="text-text-secondary text-sm">Aucun programme pour le moment.</p>
          <Link href="/admin/series/new" className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5 mt-3">
            <Plus className="w-3 h-3" /> Créer le premier programme
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {series.map((s) => (
            <Link
              key={s.id}
              href={`/admin/series/${s.slug}/edit`}
              className="card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all group"
            >
              {s.heroImage ? (
                <div className="h-24 overflow-hidden">
                  <img src={s.heroImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${s.themeColor || "var(--primary)"}, var(--accent))` }} />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{s.title}</h3>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ${s.isPublished ? "bg-success/10 text-success" : "bg-subtle text-text-secondary"}`}>
                    {s.isPublished ? "Publié" : "Brouillon"}
                  </span>
                </div>
                {s.description && (
                  <p className="text-xs text-text-secondary line-clamp-2 mt-1">{s.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                  <span className="text-[11px] text-text-secondary">
                    {s._count.events} événement{s._count.events > 1 ? "s" : ""}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-text-secondary group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
