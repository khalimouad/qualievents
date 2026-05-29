"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";

interface EventCard {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  date: string;
  themeColor: string | null;
  heroImage: string | null;
  city: string;
  format: string;
  maxAttendees: number;
  subscribersCount: number;
  panelistsCount: number;
}

interface EventsSectionProps {
  ongoingEvents: EventCard[];
  upcomingEvents: EventCard[];
  pastEvents: EventCard[];
}

export default function EventsSection({ ongoingEvents, upcomingEvents, pastEvents }: EventsSectionProps) {
  const [activeTab, setActiveTab] = useState<"ongoing" | "upcoming" | "past">(
    ongoingEvents.length > 0 ? "ongoing" : "upcoming"
  );

  const tabs = [
    ...(ongoingEvents.length > 0
      ? [{ key: "ongoing" as const, label: "En cours", count: ongoingEvents.length }]
      : []),
    { key: "upcoming" as const, label: "À venir", count: upcomingEvents.length },
    { key: "past" as const, label: "Passés", count: pastEvents.length },
  ];

  const eventsMap: Record<"ongoing" | "upcoming" | "past", EventCard[]> = {
    ongoing: ongoingEvents,
    upcoming: upcomingEvents,
    past: pastEvents,
  };

  const currentEvents = eventsMap[activeTab].slice(0, 10);
  const totalCount = eventsMap[activeTab].length;

  return (
    <section id="events" className="py-20 relative border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        {/* Tab bar */}
        <div
          className="flex items-center justify-between mb-12 border-b"
          style={{ borderColor: "rgba(232,197,71,0.12)" }}
        >
          <div className="tab-bar">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
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
              </button>
            ))}
          </div>
          <Link
            href="/admin/events/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all hover:border-yellow-500/40 hover:text-foreground"
            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
          >
            + Créer un événement
          </Link>
        </div>

        {/* Events grid */}
        {currentEvents.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl border"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            <p className="text-sm uppercase tracking-wider font-bold">Aucun événement</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentEvents.map((event, idx) => {
              const color = event.themeColor || "#E8C547";
              const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000);
              const n = idx + 1;

              return (
                <Link key={event.id} href={`/events/${event.slug}`} className={`ev-card${activeTab === "past" ? " ev-card-past" : ""}`}>
                  <div className="ev-card-img">
                    {event.heroImage ? (
                      <img src={event.heroImage} alt={event.title} />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ background: `linear-gradient(135deg, ${color}28, ${color}10)` }}
                      />
                    )}
                    {event.format && (
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
                        <span className="ev-card-attendees">{event.subscribersCount} participants · {event.city}</span>
                        <span className="ev-card-btn" style={{ borderColor: color, color }}>Voir →</span>
                      </div>
                    ) : (
                      <>
                        <div className="ev-card-meta">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.city}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.subscribersCount}/{event.maxAttendees}</span>
                        </div>
                        <div className="ev-card-footer">
                          <span className="ev-card-attendees">{event.panelistsCount} intervenants</span>
                          <span className="ev-card-btn" style={{ borderColor: color, color }}>Voir →</span>
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* See all link */}
        {totalCount > 0 && (
          <div className="mt-10 text-center">
            <Link
              href={`/events?tab=${activeTab}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border transition-all hover:border-yellow-500/40 hover:text-foreground"
              style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              Voir tous les événements →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
