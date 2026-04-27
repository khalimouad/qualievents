import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight, Sparkles, ArrowUpRight, Zap, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      _count: { select: { subscribers: true, panelists: true } },
      panelists: { take: 3, orderBy: { sortOrder: "asc" }, select: { firstName: true, lastName: true } },
    },
    orderBy: { date: "asc" },
  });

  const upcomingEvents = events.filter((e) => new Date(e.date) > new Date());
  const pastEvents = events.filter((e) => new Date(e.date) <= new Date());

  return (
    <>
      <Navbar />

      {/* HERO — Enhanced with mesh gradient */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,122,0,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(0,158,96,0.1) 0%, transparent 50%)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 w-full">
          <div className="max-w-3xl">
            {/* Badge with animation */}
            <div className="inline-flex items-center gap-2.5 border border-primary/30 bg-primary/5 rounded-full px-4 py-2.5 mb-8 animate-fade-in-down">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-foreground/90 text-xs font-semibold uppercase tracking-[0.15em]">{t.home.badge}</span>
            </div>

            {/* Headline with gradient text */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-serif font-medium text-foreground leading-[0.95] tracking-tight mb-6 animate-fade-in-up">
              {t.home.heroTitle}
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                {t.home.heroTitleAccent}
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed font-light animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.15s" }}>
              {t.home.heroSub}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.3s" }}>
              <a href="#events" className="btn-primary px-8 py-4 text-sm font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 group">
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" /> {t.home.explore} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link href="/admin" className="btn-secondary px-8 py-4 text-sm font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2">
                {t.admin.dashboard}
              </Link>
            </div>

            {/* Stats grid */}
            <div className="mt-20 grid grid-cols-3 gap-6 max-w-lg border-t border-border/40 pt-12 animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.5s" }}>
              {[
                { value: events.length, label: t.home.stats.events, icon: Calendar },
                { value: events.reduce((sum, e) => sum + e._count.subscribers, 0), label: t.home.stats.attendees, icon: Users },
                { value: events.reduce((sum, e) => sum + e._count.panelists, 0), label: t.home.stats.speakers, icon: Star },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex flex-col">
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <Icon className="w-3.5 h-3.5 text-primary opacity-70" />
                      <div className="text-3xl sm:text-4xl font-serif font-medium text-foreground">{stat.value}</div>
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-[0.15em] font-semibold">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS GRID */}
      <section id="events" className="py-20 bg-background relative border-b border-border">
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Section header */}
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="chip chip-primary mb-4 inline-block">{t.home.discover}</span>
              <h2 className="text-4xl sm:text-5xl font-serif font-medium text-foreground">{t.home.upcomingEvents}</h2>
            </div>
            <p className="text-text-secondary text-sm max-w-sm font-light">Trouvez votre prochaine expérience et inscrivez-vous dès aujourd&apos;hui.</p>
          </div>

          {/* Events grid */}
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-border bg-bg-subtle">
              <Calendar className="w-10 h-10 mx-auto mb-4 text-muted opacity-40" />
              <p className="text-muted text-sm uppercase tracking-wider font-semibold">{t.home.noUpcoming}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => {
                const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                // Emoji based on event theme (simplified)
                const emoji = ["🎉", "🌟", "🚀", "🎯", "💡", "🎭"][Math.floor(Math.random() * 6)];

                return (
                  <Link key={event.id} href={`/events/${event.slug}`} className="event-card group">
                    {/* Colored badge */}
                    <div className="event-card-badge" style={{ background: event.themeColor || "linear-gradient(135deg, var(--primary), var(--accent))" }}>
                      <span className="text-2xl">{emoji}</span>
                    </div>

                    {/* Card content */}
                    <div className="event-card-content">
                      {/* Date & countdown */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-primary transition-colors">
                          {new Date(event.date).toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {daysUntil > 0 && (
                          <span className="chip chip-primary text-[9px]">
                            dans {daysUntil}j
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="event-card-title group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>

                      {/* Tagline */}
                      {event.tagline && (
                        <p className="text-sm text-primary/75 font-medium mb-3">{event.tagline}</p>
                      )}

                      {/* Description */}
                      <p className="text-sm text-muted line-clamp-2 mb-4 font-light">{event.description}</p>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-xs text-muted mb-4 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{event.venue}, {event.city}</span>
                      </div>

                      {/* Meta footer */}
                      <div className="event-card-meta">
                        <span className="event-card-meta-item">
                          <Users className="w-3.5 h-3.5" />
                          {event._count.subscribers}/{event.maxAttendees}
                        </span>
                        <span className="event-card-meta-item">
                          {event._count.panelists} intervenants
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-primary ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Past events — Enhanced layout */}
          {pastEvents.length > 0 && (
            <div className="mt-20 border-t border-border pt-16">
              <span className="chip chip-accent mb-10 inline-block">{t.home.pastEvents}</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pastEvents.map((event, idx) => {
                  // Estimate edition based on index (simplified)
                  const editionNumber = idx + 1;
                  const frenchOrdinal = editionNumber === 1 ? "1ère" : `${editionNumber}e`;

                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
                    >
                      {/* Hero image section */}
                      <div className="relative h-48 sm:h-56 overflow-hidden bg-bg-subtle flex-shrink-0">
                        {event.heroImage ? (
                          <img
                            src={event.heroImage}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-6xl"
                            style={{
                              background: `linear-gradient(135deg, ${event.themeColor || "#ff7a00"}40 0%, ${event.themeColor || "#009e60"}40 100%)`,
                            }}
                          >
                            🎉
                          </div>
                        )}

                        {/* Color accent bar overlay */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1.5"
                          style={{ background: event.themeColor || "linear-gradient(90deg, var(--primary), var(--accent))" }}
                        />

                        {/* Edition badge */}
                        <div
                          className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg"
                          style={{ background: event.themeColor || "var(--primary)" }}
                        >
                          {frenchOrdinal} édition
                        </div>
                      </div>

                      {/* Card content section */}
                      <div className="bg-card flex flex-col flex-1 p-6 sm:p-8">
                        {/* Date */}
                        <p className="text-xs uppercase tracking-[0.2em] text-muted font-semibold mb-3">
                          {new Date(event.date).toLocaleDateString("fr-FR", { month: "long", day: "numeric", year: "numeric" })}
                        </p>

                        {/* Title */}
                        <h3 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>

                        {/* Tagline/Slogan */}
                        {event.tagline && (
                          <p className="text-sm text-text-secondary mb-4 font-light leading-relaxed flex-1">
                            {event.tagline}
                          </p>
                        )}

                        {/* Location & stats footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted uppercase tracking-wider font-semibold">📍 {event.city}</span>
                            <span className="text-sm text-foreground font-semibold mt-1">{event._count.subscribers} participants</span>
                          </div>
                          <ArrowUpRight className="w-5 h-5 text-muted group-hover:text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
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

      {/* FEATURES */}
      <section className="py-20 bg-bg-subtle relative border-b border-border">
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="mb-16 max-w-2xl">
            <span className="chip chip-primary mb-4 inline-block">{t.home.platform}</span>
            <h2 className="text-4xl sm:text-5xl font-serif font-medium text-foreground">{t.home.featuresTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              t.home.features.registration,
              t.home.features.badges,
              t.home.features.invitations,
              t.home.features.newsletters,
            ].map((f) => (
              <div key={f.title} className="group">
                <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent mb-6 group-hover:w-20 transition-all duration-500" />
                <h3 className="font-serif text-xl text-foreground mb-3 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-sm text-muted font-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(ellipse at center, rgba(255,122,0,0.1) 0%, transparent 70%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-5xl sm:text-6xl font-serif font-medium text-foreground mb-6 leading-tight">
            {t.home.readyStart.replace("?", "")}
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-12 max-w-xl mx-auto font-light leading-relaxed">
            {t.home.readyStartSub}
          </p>
          <Link href="/admin/events/new" className="btn-primary px-10 py-5 text-sm font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-3 group">
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" /> {t.home.createEvent} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
