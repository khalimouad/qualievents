import Link from "next/link";
import { MapPin, Users, ArrowRight, Sparkles, Calendar, QrCode, UserCheck, Mail, Send, CheckCircle2, Mic } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

const featureIcons = [UserCheck, QrCode, Mail, Send];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      _count: { select: { subscribers: true, panelists: true } },
    },
    orderBy: { date: "asc" },
  });

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // Ongoing: started AND (endDate in future OR no endDate but started today)
  const ongoingEvents = events.filter((e) => {
    const start = new Date(e.date);
    if (start > now) return false;
    if (e.endDate) return new Date(e.endDate) >= now;
    return start >= todayStart;
  });

  const upcomingEvents = events.filter((e) => new Date(e.date) > now);

  // Past: endDate passed OR (no endDate AND started before today)
  const pastEvents = events.filter((e) => {
    const start = new Date(e.date);
    if (start > now) return false;
    if (e.endDate) return new Date(e.endDate) < now;
    return start < todayStart;
  });

  const activeTab = ongoingEvents.length > 0 ? "ongoing" : "upcoming";

  const tabs = [
    ...(ongoingEvents.length > 0
      ? [{ key: "ongoing", label: t.home.ongoingEvents, count: ongoingEvents.length }]
      : []),
    { key: "upcoming", label: t.home.upcomingEvents, count: upcomingEvents.length },
    { key: "past", label: t.home.pastEvents, count: pastEvents.length },
  ];

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 85% 50%, rgba(232,197,71,0.07) 0%, transparent 70%)," +
              "radial-gradient(ellipse 40% 40% at 15% 80%, rgba(255,122,0,0.05) 0%, transparent 60%)," +
              "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(245,240,232,0.03) 0%, transparent 50%)",
          }}
        />

        {/* Animated glow orbs */}
        <div className="hero-orb hero-orb-gold" />
        <div className="hero-orb hero-orb-orange" />
        <div className="hero-orb hero-orb-green" />

        {/* Decorative vector — concentric compass rings */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-hidden">
          <svg
            viewBox="0 0 700 700"
            fill="none"
            className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[680px] h-[680px]"
            style={{ opacity: 0.055 }}
          >
            <circle cx="350" cy="350" r="320" stroke="#E8C547" strokeWidth="1" />
            <circle cx="350" cy="350" r="240" stroke="#E8C547" strokeWidth="1" />
            <circle cx="350" cy="350" r="160" stroke="#E8C547" strokeWidth="1" />
            <circle cx="350" cy="350" r="80" stroke="#E8C547" strokeWidth="1" />
            <line x1="30" y1="350" x2="670" y2="350" stroke="#E8C547" strokeWidth="1" />
            <line x1="350" y1="30" x2="350" y2="670" stroke="#E8C547" strokeWidth="1" />
            <line x1="124" y1="124" x2="576" y2="576" stroke="#E8C547" strokeWidth="0.75" />
            <line x1="576" y1="124" x2="124" y2="576" stroke="#E8C547" strokeWidth="0.75" />
            <circle cx="350" cy="30" r="4" fill="#E8C547" />
            <circle cx="350" cy="670" r="4" fill="#E8C547" />
            <circle cx="30" cy="350" r="4" fill="#E8C547" />
            <circle cx="670" cy="350" r="4" fill="#E8C547" />
            <circle cx="124" cy="124" r="3" fill="#E8C547" opacity="0.6" />
            <circle cx="576" cy="576" r="3" fill="#E8C547" opacity="0.6" />
            <circle cx="576" cy="124" r="3" fill="#E8C547" opacity="0.6" />
            <circle cx="124" cy="576" r="3" fill="#E8C547" opacity="0.6" />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 w-full grid lg:grid-cols-[1fr_auto] gap-14 items-center">
          {/* Left: text */}
          <div className="max-w-[560px]">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold uppercase tracking-[0.15em] animate-bounce-in"
              style={{
                background: "var(--gold-dim)",
                border: "1px solid var(--gold-border)",
                color: "var(--gold)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.home.badge}
            </div>

            <h1
              className="font-serif font-black leading-[1.02] tracking-tight mb-6 animate-fade-in-up"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5.2rem)" }}
            >
              {t.home.heroTitle}
              <span
                className="block"
                style={{
                  background: "linear-gradient(135deg, var(--gold) 0%, var(--foreground) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t.home.heroTitleAccent}
              </span>
            </h1>

            <p
              className="text-lg leading-relaxed mb-10 font-light max-w-[420px] animate-fade-in-up"
              style={{ color: "var(--muted)", opacity: 0, animationFillMode: "forwards", animationDelay: "0.15s" }}
            >
              {t.home.heroSub}
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 animate-fade-in-up"
              style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.28s" }}
            >
              <a
                href="#events"
                className="hero-gold-btn inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-serif font-black text-sm uppercase tracking-wider"
                style={{ background: "var(--gold)", color: "#0C0B09" }}
              >
                {t.home.explore} <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-serif font-bold text-sm uppercase tracking-wider border transition-all hover:border-foreground/30"
                style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
              >
                {t.admin.dashboard}
              </Link>
            </div>

            {/* Stats */}
            <div
              className="mt-14 grid grid-cols-3 gap-6 max-w-xs border-t pt-10 animate-fade-in-up"
              style={{ borderColor: "rgba(232,197,71,0.15)", opacity: 0, animationFillMode: "forwards", animationDelay: "0.45s" }}
            >
              {[
                { value: events.length, label: t.home.stats.events, Icon: Calendar },
                { value: events.reduce((s, e) => s + e._count.subscribers, 0), label: t.home.stats.attendees, Icon: Users },
                { value: events.reduce((s, e) => s + e._count.panelists, 0), label: t.home.stats.speakers, Icon: Mic },
              ].map(({ value, label, Icon }) => (
                <div key={label}>
                  <Icon className="w-3.5 h-3.5 mb-2" style={{ color: "var(--gold)", opacity: 0.65 }} />
                  <div className="font-serif font-black text-3xl" style={{ color: "var(--gold)" }}>
                    {value}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.15em] font-bold mt-1" style={{ color: "var(--muted)" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: hero illustration + event pills */}
          <div className="hidden lg:flex flex-col gap-3 flex-shrink-0 w-[285px] relative">
            {/* Soft glow behind the whole panel */}
            <div
              className="absolute -inset-8 rounded-[32px] pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, rgba(232,197,71,0.05) 0%, transparent 70%)",
                border: "1px solid rgba(232,197,71,0.05)",
              }}
            />

            {/* Badge card illustration */}
            <div className="hero-badge-card animate-float-slow">
              <div className="hero-badge-card-top">
                {/* QR code pattern */}
                <svg viewBox="0 0 72 72" fill="none" className="w-[52px] h-[52px] flex-shrink-0">
                  {/* TL finder */}
                  <rect x="1" y="1" width="27" height="27" rx="4" stroke="white" strokeWidth="1.8" strokeOpacity="0.9"/>
                  <rect x="6" y="6" width="17" height="17" rx="2" fill="white" fillOpacity="0.2"/>
                  <rect x="11" y="11" width="7" height="7" rx="1" fill="white" fillOpacity="0.85"/>
                  {/* TR finder */}
                  <rect x="44" y="1" width="27" height="27" rx="4" stroke="white" strokeWidth="1.8" strokeOpacity="0.9"/>
                  <rect x="49" y="6" width="17" height="17" rx="2" fill="white" fillOpacity="0.2"/>
                  <rect x="54" y="11" width="7" height="7" rx="1" fill="white" fillOpacity="0.85"/>
                  {/* BL finder */}
                  <rect x="1" y="44" width="27" height="27" rx="4" stroke="white" strokeWidth="1.8" strokeOpacity="0.9"/>
                  <rect x="6" y="49" width="17" height="17" rx="2" fill="white" fillOpacity="0.2"/>
                  <rect x="11" y="54" width="7" height="7" rx="1" fill="white" fillOpacity="0.85"/>
                  {/* Data module dots */}
                  <rect x="44" y="44" width="5" height="5" rx="1" fill="white" fillOpacity="0.7"/>
                  <rect x="52" y="44" width="5" height="5" rx="1" fill="white" fillOpacity="0.7"/>
                  <rect x="60" y="44" width="5" height="5" rx="1" fill="white" fillOpacity="0.7"/>
                  <rect x="44" y="52" width="5" height="5" rx="1" fill="white" fillOpacity="0.7"/>
                  <rect x="60" y="52" width="5" height="5" rx="1" fill="white" fillOpacity="0.7"/>
                  <rect x="52" y="60" width="5" height="5" rx="1" fill="white" fillOpacity="0.7"/>
                  <rect x="60" y="60" width="5" height="5" rx="1" fill="white" fillOpacity="0.7"/>
                  <rect x="44" y="60" width="5" height="5" rx="1" fill="white" fillOpacity="0.4"/>
                </svg>
                <div className="flex flex-col items-end">
                  <span className="text-white/55 text-[9px] font-bold uppercase tracking-widest">Badge</span>
                  <span className="text-white font-serif font-black text-[2rem] leading-none">#001</span>
                </div>
              </div>
              <div className="hero-badge-card-body">
                <div className="font-serif font-black text-base text-foreground leading-tight">Marie Dubois</div>
                <div className="text-xs font-semibold mt-1" style={{ color: "var(--primary)" }}>Intervenant principal</div>
                <div
                  className="text-[10px] font-semibold mt-3 uppercase tracking-wider truncate"
                  style={{ color: "var(--muted)" }}
                >
                  Forum Tech Abidjan 2025
                </div>
              </div>
            </div>

            {/* Floating check-in confirmation */}
            <div
              className="hero-checkin-badge animate-fade-in-up"
              style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.55s" }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              <span>Check-in validé</span>
            </div>

            {/* Event pills */}
            {upcomingEvents.length > 0 && (
              <>
                <div className="hero-event-label mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Prochains événements
                </div>

                {upcomingEvents.slice(0, 3).map((ev, i) => (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.slug}`}
                    className="hero-pill animate-fade-in-up group"
                    style={{
                      animationDelay: `${600 + i * 80}ms`,
                      opacity: 0,
                      animationFillMode: "forwards",
                    }}
                  >
                    <span
                      className="hero-pill-dot"
                      style={{ background: ev.themeColor || "var(--gold)" }}
                    />
                    <span className="group-hover:text-primary transition-colors truncate">{ev.title}</span>
                  </Link>
                ))}

                <div
                  className="hero-stat-badge animate-fade-in-up"
                  style={{
                    opacity: 0,
                    animationFillMode: "forwards",
                    animationDelay: `${600 + Math.min(upcomingEvents.length, 3) * 80 + 80}ms`,
                  }}
                >
                  <CheckCircle2 className="w-3 h-3" style={{ color: "var(--accent)" }} />
                  <span>
                    {events.reduce((s, e) => s + e._count.subscribers, 0).toLocaleString("fr-FR")} participants inscrits
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section id="events" className="py-20 relative border-b border-border">
        <div className="max-w-6xl mx-auto px-6">

          {/* Tab bar */}
          <div
            className="flex items-center justify-between mb-12 border-b"
            style={{ borderColor: "rgba(232,197,71,0.12)" }}
          >
            <div className="tab-bar">
              {tabs.map(({ key, label, count }) => (
                <a
                  key={key}
                  href={`#${key}`}
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
                </a>
              ))}
            </div>
            <Link
              href="/admin/events/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all hover:border-yellow-500/40 hover:text-foreground"
              style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              + {t.home.createEvent}
            </Link>
          </div>

          {/* ── Ongoing ── */}
          {ongoingEvents.length > 0 && (
            <div id="ongoing" className="mb-20">
              <div
                className="flex items-center gap-3 mb-8 pb-4 border-b"
                style={{ borderColor: "rgba(232,197,71,0.12)" }}
              >
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(16,185,129,0.12)", color: "var(--success)", border: "1px solid rgba(16,185,129,0.25)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Live
                </span>
                <h2 className="font-serif font-black text-2xl">{t.home.ongoingEvents}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ongoingEvents.map((event) => {
                  const color = event.themeColor || "#E8C547";
                  return (
                    <Link key={event.id} href={`/events/${event.slug}`} className="ev-card">
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
                        <span
                          className="ev-card-countdown"
                          style={{ background: "var(--success)" }}
                        >
                          🔴 En cours
                        </span>
                      </div>
                      <div className="ev-card-body">
                        <p className="ev-card-date">
                          {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <h3 className="ev-card-title">{event.title}</h3>
                        {(event.tagline || event.description) && (
                          <p className="ev-card-tagline">{event.tagline || event.description}</p>
                        )}
                        <div className="ev-card-meta">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {event.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {event._count.subscribers}/{event.maxAttendees}
                          </span>
                        </div>
                        <div className="ev-card-footer">
                          <span className="ev-card-attendees">{event._count.panelists} intervenants</span>
                          <span className="ev-card-btn" style={{ borderColor: color, color }}>
                            Voir →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Upcoming ── */}
          <div id="upcoming">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                <p className="text-sm uppercase tracking-wider font-bold">{t.home.noUpcoming}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingEvents.map((event) => {
                  const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000);
                  const color = event.themeColor || "#E8C547";
                  return (
                    <Link key={event.id} href={`/events/${event.slug}`} className="ev-card">
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
                        {daysUntil > 0 && (
                          <span className="ev-card-countdown" style={{ background: color }}>
                            dans {daysUntil}j
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
                        <div className="ev-card-meta">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {event.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {event._count.subscribers}/{event.maxAttendees}
                          </span>
                        </div>
                        <div className="ev-card-footer">
                          <span className="ev-card-attendees">{event._count.panelists} intervenants</span>
                          <span className="ev-card-btn" style={{ borderColor: color, color }}>
                            Voir →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Past ── */}
          {pastEvents.length > 0 && (
            <div id="past" className="mt-20">
              <div
                className="flex items-center gap-4 mb-8 pb-4 border-b"
                style={{ borderColor: "rgba(232,197,71,0.12)" }}
              >
                <h2 className="font-serif font-black text-2xl" style={{ color: "var(--muted)" }}>
                  {t.home.pastEvents}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pastEvents.map((event, idx) => {
                  const color = event.themeColor || "#E8C547";
                  const n = idx + 1;
                  return (
                    <Link key={event.id} href={`/events/${event.slug}`} className="ev-card ev-card-past">
                      <div className="ev-card-img">
                        {event.heroImage ? (
                          <img src={event.heroImage} alt={event.title} />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{ background: `linear-gradient(135deg, ${color}28, ${color}10)` }}
                          />
                        )}
                        <span className="ev-card-badge" style={{ background: color }}>
                          {n === 1 ? "1ère" : `${n}e`} édition
                        </span>
                      </div>
                      <div className="ev-card-body">
                        <p className="ev-card-date">
                          {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <h3 className="ev-card-title">{event.title}</h3>
                        {event.tagline && <p className="ev-card-tagline">{event.tagline}</p>}
                        <div className="ev-card-footer" style={{ marginTop: "auto" }}>
                          <span className="ev-card-attendees">{event._count.subscribers} participants · {event.city}</span>
                          <span className="ev-card-btn" style={{ borderColor: color, color }}>
                            Voir →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 border-b border-border" style={{ background: "var(--bg-subtle)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-bold uppercase tracking-[0.14em]"
              style={{ background: "var(--gold-dim)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
            >
              {t.home.platform}
            </div>
            <h2 className="font-serif font-black text-4xl sm:text-5xl max-w-lg leading-tight">
              {t.home.featuresTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              t.home.features.registration,
              t.home.features.badges,
              t.home.features.invitations,
              t.home.features.newsletters,
            ].map((f, i) => {
              const FeatureIcon = featureIcons[i];
              return (
                <div key={f.title} className="group">
                  <div className="feature-icon mb-6">
                    <FeatureIcon className="w-5 h-5" style={{ color: "var(--gold)" }} />
                  </div>
                  <h3 className="font-serif font-black text-lg mb-3 group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="text-sm font-light leading-relaxed" style={{ color: "var(--muted)" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, rgba(232,197,71,0.06) 0%, transparent 65%)" }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-serif font-black text-5xl sm:text-6xl leading-tight mb-6">
            {t.home.readyStart.replace("?", "")}
            <span className="block" style={{ color: "var(--gold)" }}>?</span>
          </h2>
          <p className="text-lg mb-12 font-light leading-relaxed" style={{ color: "var(--muted)" }}>
            {t.home.readyStartSub}
          </p>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-full font-serif font-black text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5"
            style={{ background: "var(--gold)", color: "#0C0B09", boxShadow: "0 8px 32px rgba(232,197,71,0.28)" }}
          >
            <Sparkles className="w-4 h-4" /> {t.home.createEvent} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
