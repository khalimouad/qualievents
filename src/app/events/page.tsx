import Link from "next/link";
import { MapPin, Users, Search, ArrowLeft, Mic, GraduationCap, Monitor, Building2, Wrench, Network, Factory, Briefcase, Handshake, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

const TYPE_META: Record<string, { Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>, color: string, bg: string, label: string }> = {
  CONFERENCE:        { Icon: Mic,          color: "#3b82f6", bg: "rgba(59,130,246,0.08)",   label: "Conférence" },
  TRAINING_SEMINAR:  { Icon: GraduationCap,color: "#f59e0b", bg: "rgba(245,158,11,0.08)",   label: "Séminaire / Formation" },
  WEBINAR:           { Icon: Monitor,      color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",   label: "Webinaire" },
  FORUM:             { Icon: Building2,    color: "#14b8a6", bg: "rgba(20,184,166,0.08)",   label: "Forum / Salon" },
  WORKSHOP:          { Icon: Wrench,       color: "#f97316", bg: "rgba(249,115,22,0.08)",   label: "Atelier" },
  NETWORKING:        { Icon: Network,      color: "#10b981", bg: "rgba(16,185,129,0.08)",   label: "Networking" },
  INDUSTRIEL:        { Icon: Factory,      color: "#64748b", bg: "rgba(100,116,139,0.08)",  label: "Industriel" },
  MANAGEMENT:        { Icon: Briefcase,    color: "#0ea5e9", bg: "rgba(14,165,233,0.08)",   label: "Management" },
  RELATION_CLIENTS:  { Icon: Handshake,    color: "#ef4444", bg: "rgba(239,68,68,0.08)",    label: "Relation clients" },
  OTHER:             { Icon: Calendar,     color: "#94a3b8", bg: "rgba(148,163,184,0.08)",  label: "Autre" },
};

const EVENT_PHOTOS = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521737604082-7d6dba67a04e?w=800&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1591115765373-5207764f18e6?w=800&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=75&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=75&auto=format&fit=crop",
];

function eventPhoto(id: string, idx: number): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) { h = (h << 5) - h + id.charCodeAt(i); h |= 0; }
  return EVENT_PHOTOS[Math.abs(h + idx) % EVENT_PHOTOS.length];
}

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tab = (typeof params.tab === "string" ? params.tab : "upcoming") as
    | "ongoing"
    | "upcoming"
    | "past";
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const category = typeof params.category === "string" ? params.category : "";
  const currentPage = typeof params.page === "string" ? Math.max(1, parseInt(params.page) || 1) : 1;

  const allEvents = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      _count: { select: { subscribers: true, panelists: true } },
    },
    orderBy: { date: "asc" },
  });

  // Distinct event types present in DB
  const rawTypes = await prisma.event.groupBy({
    by: ["eventType"],
    where: { isPublished: true },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
  const availableCategories = rawTypes.map((r) => r.eventType as string).filter(Boolean);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const ongoingEvents = allEvents.filter((e) => {
    const start = new Date(e.date);
    if (start > now) return false;
    if (e.endDate) return new Date(e.endDate) >= now;
    return start >= todayStart;
  });

  const upcomingEvents = allEvents.filter((e) => new Date(e.date) > now);

  const pastEvents = allEvents.filter((e) => {
    const start = new Date(e.date);
    if (start > now) return false;
    if (e.endDate) return new Date(e.endDate) < now;
    return start < todayStart;
  });

  const eventsMap: Record<"ongoing" | "upcoming" | "past", typeof allEvents> = {
    ongoing: ongoingEvents,
    upcoming: upcomingEvents,
    past: pastEvents,
  };

  // Determine active tab — fall back if "ongoing" selected but no ongoing events
  const activeTab: "ongoing" | "upcoming" | "past" =
    tab === "ongoing" && ongoingEvents.length === 0 ? "upcoming" : tab;

  let tabEvents = eventsMap[activeTab];

  // Filter by category
  if (category) {
    tabEvents = tabEvents.filter((e) => e.eventType === category);
  }

  // Filter by search query
  if (q) {
    const lower = q.toLowerCase();
    tabEvents = tabEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(lower) ||
        e.city.toLowerCase().includes(lower) ||
        (e.tagline && e.tagline.toLowerCase().includes(lower))
    );
  }

  const totalFiltered = tabEvents.length;
  const displayed = tabEvents.slice(0, currentPage * PAGE_SIZE);
  const hasMore = displayed.length < totalFiltered;

  const tabs = [
    ...(ongoingEvents.length > 0
      ? [{ key: "ongoing" as const, label: "En cours", count: ongoingEvents.length }]
      : []),
    { key: "upcoming" as const, label: "À venir", count: upcomingEvents.length },
    { key: "past" as const, label: "Passés", count: pastEvents.length },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-20" style={{ background: "var(--background)" }}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Page header */}
          <div className="py-12 border-b" style={{ borderColor: "rgba(232,197,71,0.12)" }}>
            <Link
              href="/#events"
              className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
              style={{ color: "var(--muted)" }}
            >
              <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
            </Link>
            <h1 className="font-serif font-black text-4xl sm:text-5xl mb-3">
              Tous les événements
            </h1>
            <p className="text-sm font-light" style={{ color: "var(--muted)" }}>
              {allEvents.length} événement{allEvents.length !== 1 ? "s" : ""} publiés
            </p>
          </div>

          {/* Tab bar + search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-6 border-b" style={{ borderColor: "rgba(232,197,71,0.12)" }}>
            <div className="tab-bar flex-1">
              {tabs.map(({ key, label, count }) => (
                <Link
                  key={key}
                  href={`/events?tab=${key}${category ? `&category=${category}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`tab-item ${key === activeTab ? "active" : ""}`}
                >
                  {label}
                  <span
                    className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
                  >
                    {count}
                  </span>
                  {key === activeTab && <span className="tab-line" />}
                </Link>
              ))}
            </div>

            {/* Search form — native GET form, no JS required */}
            <form action="/events" method="GET" className="flex items-center gap-2">
              <input type="hidden" name="tab" value={activeTab} />
              {category && <input type="hidden" name="category" value={category} />}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Rechercher..."
                  className="pl-9 pr-4 py-2.5 text-sm rounded-xl border bg-transparent outline-none focus:border-primary transition-colors"
                  style={{ border: "1px solid var(--border)", color: "var(--foreground)", minWidth: "200px" }}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                style={{ background: "var(--gold)", color: "#0C0B09" }}
              >
                OK
              </button>
            </form>
          </div>

          {/* Category filter bar */}
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-2 py-5 overflow-x-auto no-scrollbar border-b" style={{ borderColor: "rgba(232,197,71,0.12)" }}>
              {/* "Tous" pill */}
              <Link
                href={`/events?tab=${activeTab}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className="flex items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border"
                style={!category ? {
                  background: "var(--primary)",
                  borderColor: "var(--primary)",
                  color: "#fff",
                } : {
                  background: "transparent",
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                }}
              >
                Tous
              </Link>

              {availableCategories.map((typeKey) => {
                const meta = TYPE_META[typeKey] ?? TYPE_META["OTHER"];
                const { Icon, color, bg, label } = meta;
                const isActive = category === typeKey;
                return (
                  <Link
                    key={typeKey}
                    href={`/events?tab=${activeTab}&category=${typeKey}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    className="flex items-center gap-1.5 flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-bold transition-all border"
                    style={isActive ? {
                      background: color,
                      borderColor: color,
                      color: "#fff",
                    } : {
                      background: bg,
                      borderColor: `${color}30`,
                      color,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Events grid */}
          <div className="py-10">
            {tabEvents.length === 0 ? (
              <div
                className="text-center py-24 rounded-2xl border"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                <Search className="w-10 h-10 mx-auto mb-4 opacity-30" />
                <p className="text-sm uppercase tracking-wider font-bold">
                  {q ? `Aucun résultat pour « ${q} »` : "Aucun événement"}
                </p>
                {q && (
                  <Link
                    href={`/events?tab=${activeTab}${category ? `&category=${category}` : ""}`}
                    className="inline-block mt-4 text-xs underline"
                    style={{ color: "var(--gold)" }}
                  >
                    Effacer la recherche
                  </Link>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wider mb-6" style={{ color: "var(--muted)" }}>
                  {totalFiltered} événement{totalFiltered !== 1 ? "s" : ""}
                  {category && ` · ${TYPE_META[category]?.label ?? category}`}
                  {q && ` pour « ${q} »`}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayed.map((event, idx) => {
                    const color = event.themeColor || "#E8C547";
                    const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000);
                    const n = idx + 1;
                    const photo = event.heroImage || eventPhoto(event.id, idx);

                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className={`ev-card${activeTab === "past" ? " ev-card-past" : ""}`}
                      >
                        <div className="ev-card-img">
                          <img src={photo} alt={event.title} />
                          {event.format && activeTab !== "past" && (
                            <span className="ev-card-badge" style={{ background: color }}>
                              {event.format === "ONLINE" ? "En ligne" : event.format === "HYBRID" ? "Hybride" : "Présentiel"}
                            </span>
                          )}
                          {activeTab === "ongoing" && (
                            <span className="ev-card-countdown" style={{ background: "var(--success)" }}>
                              🔴 En cours
                            </span>
                          )}
                          {activeTab === "upcoming" && daysUntil > 0 && (
                            <span className="ev-card-countdown" style={{ background: color }}>
                              dans {daysUntil}j
                            </span>
                          )}
                          {activeTab === "past" && (
                            <span className="ev-card-badge" style={{ background: color }}>
                              {n === 1 ? "1ère" : `${n}e`} édition
                            </span>
                          )}
                        </div>
                        <div className="ev-card-body">
                          <p className="ev-card-date">
                            {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          <h3 className="ev-card-title">{event.title}</h3>
                          {(event.tagline || event.description) && (
                            <p className="ev-card-tagline">{event.tagline || event.description}</p>
                          )}
                          {activeTab === "past" ? (
                            <div className="ev-card-footer" style={{ marginTop: "auto" }}>
                              <span className="ev-card-attendees">{event._count.subscribers} participants · {event.city}</span>
                              <span className="ev-card-btn" style={{ borderColor: color, color }}>Voir →</span>
                            </div>
                          ) : (
                            <>
                              <div className="ev-card-meta">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.city}</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event._count.subscribers}/{event.maxAttendees}</span>
                              </div>
                              <div className="ev-card-footer">
                                <span className="ev-card-attendees">{event._count.panelists} intervenants</span>
                                <span className="ev-card-btn" style={{ borderColor: color, color }}>Voir →</span>
                              </div>
                            </>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="mt-10 text-center">
                    <Link
                      href={`/events?tab=${activeTab}${category ? `&category=${category}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}&page=${currentPage + 1}`}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold border transition-all hover:border-yellow-500/40 hover:text-foreground"
                      style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                    >
                      Voir plus ({totalFiltered - displayed.length} restants)
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
