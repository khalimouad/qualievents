import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight, Sparkles, ArrowUpRight, Zap } from "lucide-react";
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

      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-center bg-background border-b border-border">
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-border px-4 py-2 mb-8 animate-fade-in-down">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-foreground/80 text-xs font-semibold uppercase tracking-widest">{t.home.badge}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-medium text-foreground leading-[1.05] tracking-tight mb-6 animate-fade-in-up">
              {t.home.heroTitle} <i className="text-primary italic font-serif opacity-90">{t.home.heroTitleAccent}</i>
            </h1>

            <p className="text-lg text-muted max-w-xl mb-8 leading-relaxed font-light animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.2s" }}>
              {t.home.heroSub}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.3s" }}>
              <a href="#events" className="btn-primary hover-spell px-10 py-4 text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> {t.home.explore} <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/admin" className="btn-secondary px-10 py-4 text-sm uppercase tracking-wider hover-spell inline-flex items-center justify-center">
                {t.admin.dashboard}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg border-t border-border pt-10 animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.5s" }}>
            {[
              { value: events.length, label: t.home.stats.events },
              { value: events.reduce((sum, e) => sum + e._count.subscribers, 0), label: t.home.stats.attendees },
              { value: events.reduce((sum, e) => sum + e._count.panelists, 0), label: t.home.stats.speakers },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-serif text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted uppercase tracking-[0.2em] mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section id="events" className="py-16 bg-bg-subtle relative border-b border-border">
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">{t.home.discover}</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground mt-2">{t.home.upcomingEvents}</h2>
            </div>
            <p className="text-muted text-sm max-w-sm font-light">Trouvez votre prochaine expérience et inscrivez-vous dès aujourd&apos;hui.</p>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16 border border-border bg-background">
              <Calendar className="w-8 h-8 mx-auto mb-4 text-muted" />
              <p className="text-muted text-sm uppercase tracking-wider font-semibold">{t.home.noUpcoming}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => {
                const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="group relative bg-background border border-border hover-spell overflow-hidden"
                  >
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-primary transition-colors">
                          {new Date(event.date).toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        {daysUntil > 0 && (
                          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                            dans {daysUntil}j
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-serif font-medium text-foreground mb-3 link-spell inline-block">
                        {event.title}
                      </h3>
                      
                      {event.tagline && (
                        <p className="text-sm text-primary/80 font-medium mb-4">{event.tagline}</p>
                      )}
                      
                      <p className="text-sm text-muted line-clamp-3 mb-8 font-light">{event.description}</p>

                      <div className="flex items-center gap-2 text-xs text-muted mb-6 uppercase tracking-wider">
                        <MapPin className="w-3 h-3" />
                        {event.venue}, {event.city}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-border">
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {event._count.subscribers}/{event.maxAttendees}</span>
                          <span className="opacity-60">{event._count.panelists} intervenants</span>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-muted group-hover:text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="mt-20 border-t border-border pt-16">
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted font-semibold mb-8">{t.home.pastEvents}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.slug}`} className="bg-background border border-border p-6 hover-spell group">
                    <p className="text-[10px] uppercase tracking-wider text-muted mb-2">
                      {new Date(event.date).toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <h4 className="font-serif text-lg text-foreground mb-2 group-hover:text-primary transition-colors link-spell inline-block">{event.title}</h4>
                    <p className="text-xs text-muted font-light">{event.venue}, {event.city} &middot; {event._count.subscribers} participants</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-background relative border-b border-border">
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">{t.home.platform}</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground mt-2">{t.home.featuresTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {[
              t.home.features.registration,
              t.home.features.badges,
              t.home.features.invitations,
              t.home.features.newsletters,
            ].map((f) => (
              <div key={f.title} className="group">
                <div className="w-8 h-px bg-primary mb-6 group-hover:w-16 transition-all duration-500 ease-out" />
                <h3 className="font-serif text-xl text-foreground mb-3">{f.title}</h3>
                <p className="text-sm text-muted font-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-bg-subtle border-b border-border">
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-serif text-foreground mb-6 leading-tight">
            {t.home.readyStart.replace("?", "")} <i className="text-primary opacity-90">?</i>
          </h2>
          <p className="text-muted text-sm mb-10 max-w-md mx-auto font-light leading-relaxed">
            {t.home.readyStartSub}
          </p>
          <Link href="/admin/events/new" className="btn-primary hover-spell px-12 py-5 text-sm uppercase tracking-wider inline-flex items-center justify-center gap-3">
            <Sparkles className="w-4 h-4" /> {t.home.createEvent} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
