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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-secondary noise-overlay">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[120px] animate-float-slow" />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[100px] animate-float" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-20 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-fade-in-down">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-gray-300 text-sm font-medium">{t.home.badge}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6 animate-fade-in-up">
              {t.home.heroTitle} <span className="text-gradient">{t.home.heroTitleAccent}</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.2s" }}>
              {t.home.heroSub}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.3s" }}>
              <a href="#events" className="btn-primary px-8 py-4 text-base inline-flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> {t.home.explore} <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/admin" className="btn-secondary px-8 py-4 text-base inline-flex items-center justify-center">
                {t.admin.dashboard}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-6 max-w-lg animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.5s" }}>
            {[
              { value: events.length, label: t.home.stats.events },
              { value: events.reduce((sum, e) => sum + e._count.subscribers, 0), label: t.home.stats.attendees },
              { value: events.reduce((sum, e) => sum + e._count.panelists, 0), label: t.home.stats.speakers },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section id="events" className="py-14 sm:py-20 bg-secondary noise-overlay relative">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">{t.home.discover}</span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 mb-5">{t.home.upcomingEvents}</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Trouvez votre prochaine expérience et inscrivez-vous dès aujourd&apos;hui</p>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">{t.home.noUpcoming}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => {
                const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="group relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                    <div className="relative bg-white/5 border border-white/10 rounded-[20px] overflow-hidden hover:bg-white/8 hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
                      <div className="h-2 bg-gradient-to-r from-primary to-accent" style={event.themeColor ? { background: `linear-gradient(135deg, ${event.themeColor}, ${event.themeColor}88)` } : undefined} />

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          {daysUntil > 0 && (
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                              dans {daysUntil}j
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        {event.tagline && (
                          <p className="text-sm text-primary/70 font-medium mb-2">{event.tagline}</p>
                        )}
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{event.description}</p>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                          <MapPin className="w-3 h-3" />
                          {event.venue}, {event.city}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event._count.subscribers}/{event.maxAttendees}</span>
                            <span>{event._count.panelists} intervenants</span>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-primary text-gray-400 group-hover:text-white flex items-center justify-center transition-all">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="mt-20">
              <h3 className="text-center text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold mb-8">{t.home.pastEvents}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.slug}`} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors group backdrop-blur-sm">
                    <p className="text-xs text-gray-500 mb-1">
                      {new Date(event.date).toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <h4 className="font-semibold text-white text-sm group-hover:text-primary transition-colors">{event.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{event.venue}, {event.city} &middot; {event._count.subscribers} participants</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-14 sm:py-20 bg-secondary-light noise-overlay relative">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">{t.home.platform}</span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 mb-5">{t.home.featuresTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              t.home.features.registration,
              t.home.features.badges,
              t.home.features.invitations,
              t.home.features.newsletters,
            ].map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all backdrop-blur-sm">
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 overflow-hidden bg-secondary noise-overlay">
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            {t.home.readyStart.replace("?", "")} <span className="text-gradient">?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">{t.home.readyStartSub}</p>
          <Link href="/admin/events/new" className="btn-primary px-9 py-4 text-base inline-flex items-center justify-center gap-2.5">
            <Sparkles className="w-4 h-4" /> {t.home.createEvent} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
