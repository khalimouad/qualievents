import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Users, MapPin, Clock, ArrowRight, Sparkles, Globe, Zap, CalendarPlus } from "lucide-react";

const EVENT_HERO_PHOTOS = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521737604082-7d6dba67a04e?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1591115765373-5207764f18e6?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80&auto=format&fit=crop",
];

function heroFallback(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) { h = (h << 5) - h + slug.charCodeAt(i); h |= 0; }
  return EVENT_HERO_PHOTOS[Math.abs(h) % EVENT_HERO_PHOTOS.length];
}
import { googleCalendarUrl } from "@/lib/calendar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import SpeakerCard from "@/components/SpeakerCard";
import SponsorBadge from "@/components/SponsorBadge";
import EventMap from "@/components/EventMap";
import EventGallery from "@/components/EventGallery";
import InfoRequestForm from "@/components/InfoRequestForm";
import Carousel from "@/components/Carousel";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      title: true,
      tagline: true,
      description: true,
      venue: true,
      city: true,
      date: true,
      heroImage: true,
    },
  });
  if (!event) return { title: "Événement introuvable" };
  const description = event.tagline || event.description.slice(0, 160);
  const dateStr = new Date(event.date).toLocaleDateString("fr-FR", { month: "long", day: "numeric", year: "numeric" });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const canonical = baseUrl ? `${baseUrl}/events/${slug}` : `/events/${slug}`;
  return {
    title: `${event.title} - QualiEvents`,
    description,
    alternates: { canonical },
    openGraph: {
      title: event.title,
      description: `${dateStr} — ${event.venue}, ${event.city}. ${description}`,
      type: "website",
      siteName: "QualiEvents",
      url: canonical,
      images: event.heroImage ? [{ url: event.heroImage, width: 1200, height: 630, alt: event.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: `${dateStr} — ${event.venue}, ${event.city}`,
      images: event.heroImage ? [event.heroImage] : undefined,
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
      sessions: { orderBy: [{ day: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }] },
      ticketTiers: {
        orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
        include: { _count: { select: { subscribers: true } } },
      },
      documents: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      _count: { select: { subscribers: true } },
    },
  });

  if (!event || !event.isPublished) notFound();

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const dayCount = event.endDate ? Math.ceil((new Date(event.endDate).getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)) : 1;
  const isPastEvent = eventDate.getTime() <= Date.now();

  const institutionnelSponsors = event.sponsors.filter((s) => s.tier.toLowerCase() === "institutionnel");
  const platinumSponsors = event.sponsors.filter((s) => s.tier.toLowerCase() === "platinum");
  const goldSponsors = event.sponsors.filter((s) => s.tier.toLowerCase() === "gold");
  const silverSponsors = event.sponsors.filter((s) => s.tier.toLowerCase() === "silver");
  const bronzeSponsors = event.sponsors.filter((s) => s.tier.toLowerCase() === "bronze");
  const partenaireSponsors = event.sponsors.filter((s) => s.tier.toLowerCase() === "partenaire");
  const mediaSponsors = event.sponsors.filter((s) => s.tier.toLowerCase() === "media");

  const registerUrl = `/events/${slug}/register`;
  const badgeUrl = `/events/${slug}/badge`;
  const calendarIcsUrl = `/api/events/${slug}/calendar`;
  const googleCalUrl = googleCalendarUrl(event);

  // ----- JSON-LD (Schema.org Event) -----
  // Helps Google / Bing surface the event in their rich-result panels.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const eventUrl = baseUrl ? `${baseUrl}/events/${slug}` : `/events/${slug}`;
  const cheapestTier =
    event.ticketTiers && event.ticketTiers.length > 0
      ? event.ticketTiers.reduce((min, t) => (t.price < min.price ? t : min))
      : null;
  const offerPrice = cheapestTier?.price ?? event.ticketPrice ?? 0;
  const offerCurrency = cheapestTier?.currency ?? event.currency;
  const eventStatus = isPastEvent
    ? "https://schema.org/EventPostponed"
    : "https://schema.org/EventScheduled";
  const attendanceMode =
    event.format === "ONLINE"
      ? "https://schema.org/OnlineEventAttendanceMode"
      : event.format === "HYBRID"
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.date.toISOString(),
    endDate: (event.endDate ?? event.date).toISOString(),
    eventStatus,
    eventAttendanceMode: attendanceMode,
    image: event.heroImage ? [event.heroImage] : undefined,
    url: eventUrl,
    organizer: {
      "@type": "Organization",
      name: process.env.ORG_NAME || "QualiEvents",
      url: baseUrl || undefined,
    },
    location:
      event.format === "ONLINE"
        ? {
            "@type": "VirtualLocation",
            url: event.streamUrl || eventUrl,
          }
        : {
            "@type": "Place",
            name: event.venue,
            address: {
              "@type": "PostalAddress",
              streetAddress: event.address,
              addressLocality: event.city,
              addressCountry: event.country,
            },
            ...(event.latitude && event.longitude
              ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: event.latitude,
                    longitude: event.longitude,
                  },
                }
              : {}),
          },
    performer: event.panelists.length
      ? event.panelists.map((p) => ({
          "@type": "Person",
          name: `${p.firstName} ${p.lastName}`.trim(),
          ...(p.jobTitle ? { jobTitle: p.jobTitle } : {}),
        }))
      : undefined,
    offers:
      event.isPaid && offerPrice > 0
        ? {
            "@type": "Offer",
            url: `${eventUrl}/register`,
            price: offerPrice,
            priceCurrency: offerCurrency,
            availability: isPastEvent ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            validFrom: new Date().toISOString(),
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-black">
        {/* Hero background — real photo always shown */}
        <div className="absolute inset-0">
          <img
            src={event.heroImage || heroFallback(event.slug)}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Theme-color tinted gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${event.themeColor || "#ff7a00"}66 0%, transparent 45%, ${event.themeColor || "#009e60"}55 100%)`,
            }}
          />
          {/* Bottom-up dark gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          {/* Top vignette for navbar legibility */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-20 pb-12">
          {isPastEvent && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full animate-fade-in-down bg-white/15 backdrop-blur-md border border-white/25`}>
              <Clock className={`w-3.5 h-3.5 text-white`} />
              <span className={`text-xs font-bold uppercase tracking-wider text-white`}>{t.event.pastBadge}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 animate-fade-in-down">
            <div className={`inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 bg-white/15 backdrop-blur-xl border border-white/25 shadow-xl`}>
              <div className={`w-2 h-2 rounded-full ${isPastEvent ? "bg-white/60" : "bg-success animate-pulse"}`} />
              <Calendar className={`w-3.5 h-3.5 text-white`} />
              <span className={`text-sm font-medium text-white`}>{formattedDate}</span>
            </div>
            {event.format !== "IN_PERSON" && (
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 bg-white/15 backdrop-blur-xl border border-white/25 shadow-xl`}>
                <span className="text-base">🎥</span>
                <span className={`text-sm font-medium text-white`}>
                  {event.format === "ONLINE" ? "100% en ligne" : "Hybride — sur place + en ligne"}
                  {event.platform ? ` · ${event.platform}` : ""}
                </span>
              </div>
            )}
          </div>

          {event.tagline && (
            <p
              className={`text-sm font-semibold uppercase tracking-[0.2em] mb-4 animate-fade-in-up text-white`}
              style={{ textShadow: `0 2px 16px ${event.themeColor || "#ff7a00"}, 0 0 40px rgba(0,0,0,0.6)` }}
            >
              {event.tagline}
            </p>
          )}

          <h1
            className={`text-4xl sm:text-5xl md:text-7xl font-bold mb-4 leading-[0.95] tracking-tight animate-fade-in-up text-white`}
            style={{ textShadow: "0 4px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)" }}
          >
            {event.title}
          </h1>

          <p
            className={`text-base sm:text-lg max-w-2xl mx-auto mb-6 leading-relaxed animate-fade-in-up text-white/95`}
            style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.2s", textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}
          >
            {event.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-4 animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.3s" }}>
            {[
              { icon: <MapPin className="w-4 h-4" />, text: `${event.venue}, ${event.city}` },
              { icon: <Users className="w-4 h-4" />, text: `${event._count.subscribers} / ${event.maxAttendees}` },
              { icon: <Clock className="w-4 h-4" />, text: `${dayCount} ${dayCount > 1 ? t.event.daysP : t.event.days}` },
            ].map((pill) => (
              <div
                key={pill.text}
                className={`rounded-full px-4 py-2 flex items-center gap-2 text-sm bg-white/15 backdrop-blur-xl border border-white/25 shadow-lg`}
              >
                <span className="text-white">{pill.icon}</span>
                <span className="text-white">{pill.text}</span>
              </div>
            ))}
          </div>

          {!isPastEvent && (
            <div className="mb-4 animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.4s" }}>
              <CountdownTimer targetDate={event.date.toISOString()} onImage={true} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.5s" }}>
            {!isPastEvent ? (
              <>
                <Link href={registerUrl} className="btn-primary px-9 py-4 text-base inline-flex items-center justify-center gap-2.5 animate-pulse-glow">
                  <Sparkles className="w-4 h-4" /> {t.nav.registerNow} <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#about"
                  className="px-9 py-4 text-base inline-flex items-center justify-center font-semibold rounded-full transition-all bg-white/15 backdrop-blur-xl border-2 border-white/40 text-white hover:bg-white/25 shadow-lg"
                >
                  {t.event.learnMore}
                </a>
              </>
            ) : (
              <a href="#info-request" className="btn-primary px-9 py-4 text-base inline-flex items-center justify-center gap-2.5">
                <Sparkles className="w-4 h-4" /> {t.event.infoRequest.submit}
              </a>
            )}
          </div>

          {/* Add to Calendar — only for upcoming */}
          {!isPastEvent && (
            <div className="mt-6 flex items-center justify-center gap-3 animate-fade-in-up" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.6s" }}>
              <a
                href={calendarIcsUrl}
                className={`inline-flex items-center gap-2 text-sm transition-colors text-white/85 hover:text-white`}
              >
                <CalendarPlus className="w-4 h-4" /> {t.event.downloadIcs}
              </a>
              <span className="text-white/40">|</span>
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-sm transition-colors text-white/85 hover:text-white`}
              >
                <Calendar className="w-4 h-4" /> {t.event.googleCalendar}
              </a>
            </div>
          )}
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in z-10" style={{ animationDelay: "1.5s", opacity: 0, animationFillMode: "forwards" }}>
          <div className="w-5 h-9 border rounded-full flex items-start justify-center p-1.5 border-white/50">
            <div className="w-0.5 h-2.5 rounded-full animate-bounce bg-white/80" />
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
            <p className="text-text-secondary max-w-xl mx-auto">{t.event.aboutSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-4">
            {[
              { icon: <Users className="w-6 h-6" />, title: t.event.networking.title, desc: `${t.event.networking.desc} (${event.maxAttendees}+)`, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
              { icon: <Zap className="w-6 h-6" />, title: t.event.workshops.title, desc: t.event.workshops.desc, color: "from-primary to-primary-dark", shadow: "shadow-primary/20" },
              event.format === "ONLINE"
                ? { icon: <Globe className="w-6 h-6" />, title: "Diffusion en ligne", desc: `${event.platform || "Visioconférence"} — le lien d'accès vous est envoyé après inscription.`, color: "from-accent to-accent-light", shadow: "shadow-accent/20" }
                : { icon: <Globe className="w-6 h-6" />, title: t.event.venue.title, desc: `${event.venue}, ${event.city}, ${event.country}${event.format === "HYBRID" ? " — diffusion en ligne disponible" : ""}`, color: "from-accent to-accent-light", shadow: "shadow-accent/20" },
            ].map((card) => (
              <div key={card.title} className="group relative">
                <div className="relative bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-[20px] p-8 border border-black/5 dark:border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 border-black/10 dark:border-white/20 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-lg ${card.shadow} group-hover:scale-110 transition-transform duration-500`}>
                    <span className="text-white">{card.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{card.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTEXT / OBJECTIVES / TARGET AUDIENCE */}
      {(event.context || event.objectives || event.targetAudience) && (
        <section id="programme-detail" className="py-8 sm:py-12 bg-background noise-overlay relative">
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              {event.context && (
                <article className="card p-6 md:col-span-2">
                  <h3 className="text-xs uppercase tracking-[0.15em] text-primary font-semibold mb-2">Contexte et enjeux</h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">{event.context}</p>
                </article>
              )}
              {event.objectives && (
                <article className="card p-6">
                  <h3 className="text-xs uppercase tracking-[0.15em] text-primary font-semibold mb-3">Objectifs</h3>
                  <ul className="space-y-1.5 text-sm text-foreground">
                    {event.objectives.split(/\n+/).filter(Boolean).map((line, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-primary" />
                        <span className="leading-relaxed">{line.replace(/^[-•·]\s*/, "")}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )}
              {event.targetAudience && (
                <article className="card p-6">
                  <h3 className="text-xs uppercase tracking-[0.15em] text-primary font-semibold mb-3">Public cible</h3>
                  <ul className="space-y-1.5 text-sm text-foreground">
                    {event.targetAudience.split(/\n+/).filter(Boolean).map((line, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-primary" />
                        <span className="leading-relaxed">{line.replace(/^[-•·]\s*/, "")}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )}
            </div>
          </div>
        </section>
      )}

      {/* PROGRAMME — sessions grouped by day */}
      {event.sessions && event.sessions.length > 0 && (
        <section id="programme" className="py-8 sm:py-12 bg-surface noise-overlay relative">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">Le programme</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-5">Contenu et déroulé</h2>
            </div>
            <div className="space-y-6">
              {Array.from(new Set(event.sessions.map((s) => s.day))).sort((a, b) => a - b).map((day) => {
                const items = event.sessions.filter((s) => s.day === day);
                const dayDate = new Date(eventDate);
                dayDate.setDate(dayDate.getDate() + (day - 1));
                return (
                  <div key={day} className="card overflow-hidden">
                    <header className="px-5 py-3 border-b border-border bg-subtle/50">
                      <p className="text-xs uppercase tracking-[0.15em] text-text-secondary font-semibold">Jour {day}</p>
                      <p className="text-sm text-foreground font-medium mt-0.5">
                        {dayDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                    </header>
                    <ol className="divide-y divide-border">
                      {items.map((s) => {
                        const emoji =
                          s.kind === "WORKSHOP" ? "🛠️" :
                          s.kind === "BREAK" ? "☕" :
                          s.kind === "VISIT" ? "🏛️" :
                          s.kind === "DINNER" ? "🍽️" :
                          s.kind === "NETWORKING" ? "🤝" :
                          s.kind === "EXAM" ? "📝" : "📘";
                        return (
                          <li key={s.id} className="px-5 py-4 flex items-start gap-4">
                            <div className="hidden sm:flex flex-col items-end pt-0.5 w-20 flex-shrink-0">
                              {(s.startTime || s.endTime) && (
                                <span className="text-xs text-foreground font-mono font-semibold">
                                  {s.startTime || ""}{s.endTime ? ` – ${s.endTime}` : ""}
                                </span>
                              )}
                              {s.location && (
                                <span className="text-[10px] text-text-secondary mt-0.5 truncate max-w-full">📍 {s.location}</span>
                              )}
                            </div>
                            <span className="text-2xl flex-shrink-0" aria-hidden>{emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">{s.title}</p>
                              {s.speakerName && (
                                <p className="text-xs text-primary mt-0.5">Avec {s.speakerName}</p>
                              )}
                              {s.description && (
                                <p className="text-sm text-text-secondary mt-1.5 leading-relaxed whitespace-pre-line">{s.description}</p>
                              )}
                              <div className="sm:hidden mt-1.5 flex items-center gap-3 text-[11px] text-text-secondary">
                                {(s.startTime || s.endTime) && (
                                  <span className="font-mono">{s.startTime || ""}{s.endTime ? ` – ${s.endTime}` : ""}</span>
                                )}
                                {s.location && <span>📍 {s.location}</span>}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* DOCUMENTS — downloadable PDFs */}
      {event.documents && event.documents.length > 0 && (
        <section id="documents" className="py-6 sm:py-8 bg-background relative">
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xs uppercase tracking-[0.15em] text-text-secondary font-semibold mb-3">À télécharger</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {event.documents.map((d) => {
                const emoji =
                  d.kind === "PROGRAMME" ? "📅" :
                  d.kind === "BROCHURE" ? "📕" :
                  d.kind === "LOGISTICS" ? "🗺️" :
                  d.kind === "TERMS" ? "📜" : "📎";
                return (
                  <a
                    key={d.id}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card p-3 flex items-center gap-3 hover:border-primary/40 hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl flex-shrink-0" aria-hidden>{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{d.title}</p>
                      <p className="text-[10px] uppercase tracking-wider text-text-secondary mt-0.5">
                        {d.kind === "PROGRAMME" ? "Programme" :
                         d.kind === "BROCHURE" ? "Brochure" :
                         d.kind === "LOGISTICS" ? "Logistique" :
                         d.kind === "TERMS" ? "Conditions" : "Document"}
                      </p>
                    </div>
                    <span className="text-text-secondary group-hover:text-primary transition-colors text-sm">↓</span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* TARIFS — pricing tiers for paid events */}
      {event.isPaid && event.ticketTiers && event.ticketTiers.length > 0 && (
        <section id="tarifs" className="py-8 sm:py-12 bg-background noise-overlay relative">
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">Inscription</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-3">Choisissez votre tarif</h2>
              <p className="text-text-secondary max-w-xl mx-auto">
                {isPastEvent ? "Cet événement est passé." : "Cliquez sur le tarif qui vous convient pour finaliser votre inscription."}
              </p>
            </div>

            <div className={`grid gap-4 ${event.ticketTiers.length === 1 ? "max-w-md mx-auto" : event.ticketTiers.length === 2 ? "sm:grid-cols-2 max-w-3xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
              {event.ticketTiers.map((t) => {
                const sold = t._count?.subscribers ?? 0;
                const remaining = t.capacity == null ? null : Math.max(t.capacity - sold, 0);
                const now = Date.now();
                const inWindow =
                  (!t.availableFrom || new Date(t.availableFrom).getTime() <= now) &&
                  (!t.availableUntil || new Date(t.availableUntil).getTime() >= now);
                const purchasable = !isPastEvent && t.available && inWindow && (remaining == null || remaining > 0);
                const priceFormatted = new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: t.currency,
                  maximumFractionDigits: 0,
                }).format(t.price);

                return (
                  <article
                    key={t.id}
                    className={`card p-5 flex flex-col transition-all ${
                      purchasable ? "hover:border-primary hover:shadow-lg" : "opacity-70"
                    }`}
                  >
                    <header className="mb-3">
                      <h3 className="text-lg font-bold text-foreground">{t.name}</h3>
                      {t.description && (
                        <p className="text-xs text-text-secondary mt-1">{t.description}</p>
                      )}
                    </header>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary tabular-nums">{priceFormatted}</span>
                      <span className="text-xs text-text-secondary ml-2">/ personne</span>
                    </div>

                    {t.inclusions && t.inclusions.length > 0 && (
                      <ul className="space-y-1.5 flex-1 mb-4">
                        {t.inclusions.map((inc, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                            <span className="leading-snug">{inc}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {remaining !== null && remaining <= 5 && remaining > 0 && (
                      <p className="text-[11px] text-warning font-medium mb-2">
                        Plus que {remaining} place{remaining > 1 ? "s" : ""}
                      </p>
                    )}

                    {purchasable ? (
                      <Link
                        href={`/events/${slug}/register?tier=${t.id}`}
                        className="btn-primary w-full py-2.5 text-xs uppercase tracking-wider justify-center"
                      >
                        Choisir ce tarif
                      </Link>
                    ) : (
                      <span className="block w-full py-2.5 text-xs uppercase tracking-wider text-center rounded-full bg-subtle text-text-secondary border border-border">
                        {isPastEvent ? "Événement passé" : remaining === 0 ? "Complet" : "Indisponible"}
                      </span>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SPEAKERS */}
      {event.panelists.length > 0 && (
        <section id="speakers" className="py-8 sm:py-12 bg-surface noise-overlay relative">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">{t.event.meetExperts}</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-5">{t.event.speakersPanelists}</h2>
            </div>
            <Carousel ariaLabel="Intervenants" itemClass="w-[260px] sm:w-[280px]">
              {event.panelists.map((p) => <SpeakerCard key={p.id} {...p} />)}
            </Carousel>
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
            <div className="space-y-10">
              {[{ label: "Institutionnel", items: institutionnelSponsors, size: "w-[220px] sm:w-[260px]" },
                { label: "Platinum", items: platinumSponsors, size: "w-[220px] sm:w-[260px]" },
                { label: "Gold", items: goldSponsors, size: "w-[180px] sm:w-[200px]" },
                { label: "Silver", items: silverSponsors, size: "w-[150px] sm:w-[170px]" },
                { label: "Bronze", items: bronzeSponsors, size: "w-[130px] sm:w-[140px]" },
                { label: "Partenaire", items: partenaireSponsors, size: "w-[150px] sm:w-[170px]" },
                { label: "Média", items: mediaSponsors, size: "w-[150px] sm:w-[170px]" },
              ].filter((t) => t.items.length > 0).map((tier) => (
                <div key={tier.label}>
                  <div className="flex items-center gap-3 justify-center mb-5">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
                    <span className="text-xs uppercase tracking-[0.2em] text-text-secondary font-semibold">{tier.label}</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
                  </div>
                  <Carousel ariaLabel={`Sponsors ${tier.label}`} itemClass={tier.size}>
                    {tier.items.map((s) => <SponsorBadge key={s.id} {...s} />)}
                  </Carousel>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALLERY — for events that have photos */}
      {event.gallery && event.gallery.length > 0 && (
        <section id="gallery" className="py-8 sm:py-12 bg-background noise-overlay relative">
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">{t.event.gallery}</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-foreground mt-3 mb-3">{t.event.galleryTitle}</h2>
              <p className="text-text-secondary max-w-xl mx-auto">{t.event.gallerySub}</p>
            </div>
            <EventGallery images={event.gallery} />
          </div>
        </section>
      )}

      {/* CTA / Info Request */}
      {isPastEvent ? (
        <section id="info-request" className="relative py-12 overflow-hidden bg-background noise-overlay">
          <div className="absolute inset-0 grid-pattern" />
          <div className="relative z-10 max-w-3xl mx-auto px-4">
            <InfoRequestForm eventId={event.id} />
          </div>
        </section>
      ) : (
        <section className="relative py-10 overflow-hidden bg-background noise-overlay">
          <div className="absolute inset-0 grid-pattern" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">{t.event.readyJoin} <span className="text-gradient">{t.event.readyJoinAccent}</span> ?</h2>
            <p className="text-text-secondary text-lg mb-6 max-w-xl mx-auto">{t.event.readyJoinSub}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={registerUrl} className="btn-primary px-9 py-4 text-base inline-flex items-center justify-center gap-2.5">
                <Sparkles className="w-4 h-4" /> {t.nav.registerNow} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href={badgeUrl} className="btn-secondary px-9 py-4 text-base inline-flex items-center justify-center">{t.nav.getBadge}</Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
