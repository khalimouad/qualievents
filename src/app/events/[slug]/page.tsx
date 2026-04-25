import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Users, MapPin, Clock, ArrowRight, Sparkles, Globe, Zap, CalendarPlus } from "lucide-react";
import { googleCalendarUrl } from "@/lib/calendar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import SpeakerCard from "@/components/SpeakerCard";
import SponsorBadge from "@/components/SponsorBadge";
import EventMap from "@/components/EventMap";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { title: true, tagline: true, description: true, venue: true, city: true, date: true },
  });
  if (!event) return { title: "Événement introuvable" };
  const description = event.tagline || event.description.slice(0, 160);
  const dateStr = new Date(event.date).toLocaleDateString("fr-FR", { month: "long", day: "numeric", year: "numeric" });
  return {
    title: `${event.title} - QualiEvents`,
    description,
    openGraph: {
      title: event.title,
      description: `${dateStr} — ${event.venue}, ${event.city}. ${description}`,
      type: "website",
      siteName: "QualiEvents",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: `${dateStr} — ${event.venue}, ${event.city}`,
    },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      panelists: { orderBy: { sortOrder: "asc" } },
      sponsors: { orderBy: { sortOrder: "asc" } },
      _count: { select: { subscribers: true } },
    },
  });

  if (!event || !event.isPublished) notFound();

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const dayCount = event.endDate ? Math.ceil((new Date(event.endDate).getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)) : 1;

  const platinumSponsors = event.sponsors.filter((s) => s.tier === "platinum");
  const goldSponsors = event.sponsors.filter((s) => s.tier === "gold");
  const silverSponsors = event.sponsors.filter((s) => s.tier === "silver");
  const bronzeSponsors = event.sponsors.filter((s) => s.tier === "bronze");

  const registerUrl = `/events/${slug}/register`;
  const badgeUrl = `/events/${slug}/badge`;
  const calendarIcsUrl = `/api/events/${slug}/calendar`;
  const googleCalUrl = googleCalendarUrl(event);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background noise-overlay">
        {/* Hero background image if set */}
        {event.heroImage && (
          <div className="absolute inset-0">
            <img src={event.heroImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/60 dark:bg-background/85 backdrop-blur-[2px] dark:backdrop-blur-0" />
          </div>
        )}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/20 dark:bg-primary/8 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-accent/25 dark:bg-accent/10 rounded-full blur-[80px] animate-float" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 dark:bg-primary/3 rounded-full blur-[120px]" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[15%] w-2 h-2 bg-primary/10 dark:bg-primary/30 rounded-full animate-float" />
          <div className="absolute top-40 right-[20%] w-1.5 h-1.5 bg-white/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-40 left-[25%] w-1 h-1 bg-primary/40 rounded-full animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-20 pb-12">
          <div className="inline-flex items-center gap-2.5 glass rounded-full px-5 py-2.5 mb-6 animate-fade-in-down">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground/80 text-sm font-medium">{formattedDate}</span>
          </div>

          {event.tagline && (
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-4 animate-fade-in-up">{event.tagline}</p>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground mb-4 leading-[0.95] tracking-tight animate-fade-in-up">
            {event.title}
          </h1>

          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto mb-6 leading-relaxed animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.2s" }}>
            {event.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-4 animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.3s" }}>
            {[
              { icon: <MapPin className="w-4 h-4" />, text: `${event.venue}, ${event.city}` },
              { icon: <Users className="w-4 h-4" />, text: `${event._count.subscribers} / ${event.maxAttendees}` },
              { icon: <Clock className="w-4 h-4" />, text: `${dayCount} ${dayCount > 1 ? t.event.daysP : t.event.days}` },
            ].map((pill) => (
              <div key={pill.text} className="glass rounded-full px-4 py-2 flex items-center gap-2 text-sm">
                <span className="text-primary">{pill.icon}</span>
                <span className="text-foreground/80">{pill.text}</span>
              </div>
            ))}
          </div>

          <div className="mb-4 animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.4s" }}>
            <CountdownTimer targetDate={event.date.toISOString()} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.5s" }}>
            <Link href={registerUrl} className="btn-primary px-9 py-4 text-base inline-flex items-center justify-center gap-2.5 animate-pulse-glow">
              <Sparkles className="w-4 h-4" /> {t.nav.registerNow} <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#about" className="btn-secondary px-9 py-4 text-base inline-flex items-center justify-center">{t.event.learnMore}</a>
          </div>

          {/* Add to Calendar */}
          <div className="mt-6 flex items-center justify-center gap-3 animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.6s" }}>
            <a
              href={calendarIcsUrl}
              className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm transition-colors"
            >
              <CalendarPlus className="w-4 h-4" /> {t.event.downloadIcs}
            </a>
            <span className="text-gray-600">|</span>
            <a
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm transition-colors"
            >
              <Calendar className="w-4 h-4" /> {t.event.googleCalendar}
            </a>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: "1.5s", opacity: 0, animationFillMode: "forwards" }}>
          <div className="w-5 h-9 border border-black/10 dark:border-white/20 rounded-full flex items-start justify-center p-1.5">
            <div className="w-0.5 h-2.5 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-8 sm:py-12 bg-background noise-overlay relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 dark:bg-primary/8 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">{t.event.whyAttend}</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-5">{t.event.aboutEvent}</h2>
            <p className="text-muted max-w-xl mx-auto">{t.event.aboutSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-4">
            {[
              { icon: <Users className="w-6 h-6" />, title: t.event.networking.title, desc: `${t.event.networking.desc} (${event.maxAttendees}+)`, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
              { icon: <Zap className="w-6 h-6" />, title: t.event.workshops.title, desc: t.event.workshops.desc, color: "from-primary to-primary-dark", shadow: "shadow-primary/20" },
              { icon: <Globe className="w-6 h-6" />, title: t.event.venue.title, desc: `${event.venue}, ${event.city}, ${event.country}`, color: "from-accent to-accent-light", shadow: "shadow-accent/20" },
            ].map((card) => (
              <div key={card.title} className="group relative">
                <div className="relative bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-[20px] p-8 border border-black/5 dark:border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 border-black/10 dark:border-white/20 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-lg ${card.shadow} group-hover:scale-110 transition-transform duration-500`}>
                    <span className="text-foreground">{card.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{card.title}</h3>
                  <p className="text-muted leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPEAKERS */}
      {event.panelists.length > 0 && (
        <section id="speakers" className="py-8 sm:py-12 bg-surface noise-overlay relative">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">{t.event.meetExperts}</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-5">{t.event.speakersPanelists}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {event.panelists.map((p) => <SpeakerCard key={p.id} {...p} />)}
            </div>
          </div>
        </section>
      )}

      {/* LOCATION */}
      {event.latitude && event.longitude && (
        <section id="location" className="py-8 sm:py-12 bg-background noise-overlay relative">
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">{t.event.whereToFind}</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-5">{t.event.eventLocation}</h2>
            </div>
            <EventMap latitude={event.latitude} longitude={event.longitude} venue={event.venue} address={event.address} city={event.city} country={event.country} />
          </div>
        </section>
      )}

      {/* SPONSORS */}
      {event.sponsors.length > 0 && (
        <section id="sponsors" className="py-8 sm:py-12 bg-surface noise-overlay relative">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">{t.event.ourPartners}</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-5">{t.event.sponsorsTitle}</h2>
            </div>
            <div className="space-y-14">
              {[{ label: "Platinum", items: platinumSponsors, cols: "grid-cols-1 sm:grid-cols-2", max: "max-w-2xl" },
                { label: "Gold", items: goldSponsors, cols: "grid-cols-2 sm:grid-cols-3", max: "max-w-3xl" },
                { label: "Silver", items: silverSponsors, cols: "grid-cols-2 sm:grid-cols-4", max: "max-w-3xl" },
                { label: "Bronze", items: bronzeSponsors, cols: "grid-cols-3 sm:grid-cols-5", max: "max-w-3xl" },
              ].filter((t) => t.items.length > 0).map((tier) => (
                <div key={tier.label}>
                  <div className="flex items-center gap-3 justify-center mb-6">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
                    <span className="text-xs uppercase tracking-[0.2em] text-muted font-semibold">{tier.label}</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
                  </div>
                  <div className={`grid ${tier.cols} gap-4 ${tier.max} mx-auto`}>
                    {tier.items.map((s) => <SponsorBadge key={s.id} {...s} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-10 overflow-hidden bg-background noise-overlay">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">{t.event.readyJoin} <span className="text-gradient">{t.event.readyJoinAccent}</span> ?</h2>
          <p className="text-muted text-lg mb-6 max-w-xl mx-auto">{t.event.readyJoinSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={registerUrl} className="btn-primary px-9 py-4 text-base inline-flex items-center justify-center gap-2.5">
              <Sparkles className="w-4 h-4" /> {t.nav.registerNow} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={badgeUrl} className="btn-secondary px-9 py-4 text-base inline-flex items-center justify-center">{t.nav.getBadge}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
