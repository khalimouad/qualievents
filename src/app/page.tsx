import Link from "next/link";
import { Calendar, Users, MapPin, Clock, ArrowRight, Sparkles, Mic2, Globe, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import SpeakerCard from "@/components/SpeakerCard";
import SponsorBadge from "@/components/SponsorBadge";
import EventMap from "@/components/EventMap";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const event = await prisma.event.findFirst({
    where: { isPublished: true },
    include: {
      panelists: { orderBy: { sortOrder: "asc" } },
      sponsors: { orderBy: { sortOrder: "asc" } },
      _count: { select: { subscribers: true } },
    },
  });

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary-light to-accent noise-overlay grid-pattern">
        <div className="relative z-10 text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/30 animate-float">
            <span className="text-white font-bold text-3xl">Q</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">QualiEvents</h1>
          <p className="text-gray-400 mb-10 max-w-sm mx-auto">No events published yet. Create your first event to get started.</p>
          <Link href="/admin" className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2">
            Go to Admin Panel <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const platinumSponsors = event.sponsors.filter((s) => s.tier === "platinum");
  const goldSponsors = event.sponsors.filter((s) => s.tier === "gold");
  const silverSponsors = event.sponsors.filter((s) => s.tier === "silver");
  const bronzeSponsors = event.sponsors.filter((s) => s.tier === "bronze");

  return (
    <>
      <Navbar />

      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-secondary noise-overlay">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern" />

        {/* Ambient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px] animate-float" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/3 rounded-full blur-[120px]" />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[15%] w-2 h-2 bg-primary/30 rounded-full animate-float" style={{ animationDelay: "0s" }} />
          <div className="absolute top-40 right-[20%] w-1.5 h-1.5 bg-white/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-40 left-[25%] w-1 h-1 bg-primary/40 rounded-full animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-60 right-[10%] w-2.5 h-2.5 bg-accent/20 rounded-full animate-float-slow" style={{ animationDelay: "0.5s" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-28 pb-20">
          {/* Date badge */}
          <div className="inline-flex items-center gap-2.5 glass rounded-full px-5 py-2.5 mb-10 animate-fade-in-down">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-gray-300 text-sm font-medium">{formattedDate}</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white mb-8 leading-[0.95] tracking-tight animate-fade-in-up">
            {event.title.split(" ").map((word, i) => (
              <span key={i}>
                {i === event.title.split(" ").length - 1 ? (
                  <span className="text-gradient">{word}</span>
                ) : (
                  word
                )}{" "}
              </span>
            ))}
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-2" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.2s" }}>
            {event.description}
          </p>

          {/* Meta pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-14 animate-fade-in-up stagger-3" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.3s" }}>
            {[
              { icon: <MapPin className="w-4 h-4" />, text: `${event.venue}, ${event.city}` },
              { icon: <Users className="w-4 h-4" />, text: `${event._count.subscribers} / ${event.maxAttendees}` },
              { icon: <Clock className="w-4 h-4" />, text: "3 Days" },
            ].map((pill) => (
              <div key={pill.text} className="glass rounded-full px-4 py-2 flex items-center gap-2 text-sm">
                <span className="text-primary">{pill.icon}</span>
                <span className="text-gray-300">{pill.text}</span>
              </div>
            ))}
          </div>

          {/* Countdown */}
          <div className="mb-14 animate-fade-in-up stagger-4" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.4s" }}>
            <CountdownTimer targetDate={event.date.toISOString()} />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-5" style={{ opacity: 0, animationFillMode: "forwards", animationDelay: "0.5s" }}>
            <Link
              href="/register"
              className="btn-primary px-9 py-4 text-base inline-flex items-center justify-center gap-2.5 animate-pulse-glow"
            >
              <Sparkles className="w-4 h-4" />
              Register Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#about"
              className="btn-secondary px-9 py-4 text-base inline-flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: "1.5s", opacity: 0, animationFillMode: "forwards" }}>
          <div className="w-5 h-9 border border-white/20 rounded-full flex items-start justify-center p-1.5">
            <div className="w-0.5 h-2.5 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="py-24 sm:py-32 bg-white relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/3 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">Why Attend</span>
            <h2 className="text-3xl sm:text-5xl font-bold text-secondary mt-3 mb-5">
              About the Event
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Three days of immersive learning, networking, and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                title: "Networking",
                desc: `Connect with ${event.maxAttendees}+ professionals, industry leaders, and innovators from around the world.`,
                color: "from-blue-500 to-indigo-600",
                shadowColor: "shadow-blue-500/20",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Workshops",
                desc: "Hands-on sessions with expert practitioners covering the latest trends and technologies.",
                color: "from-primary to-primary-dark",
                shadowColor: "shadow-primary/20",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Venue",
                desc: `Hosted at the prestigious ${event.venue} in the heart of ${event.city}, ${event.country}.`,
                color: "from-accent to-accent-light",
                shadowColor: "shadow-accent/20",
              },
            ].map((card) => (
              <div key={card.title} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-gray-100 to-transparent rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-[20px] p-8 border border-gray-100 card-hover">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-lg ${card.shadowColor} group-hover:scale-110 transition-transform duration-500`}>
                    <span className="text-white">{card.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-3">{card.title}</h3>
                  <p className="text-muted leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SPEAKERS ============ */}
      {event.panelists.length > 0 && (
        <section id="speakers" className="py-24 sm:py-32 bg-background relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">Meet Our Experts</span>
              <h2 className="text-3xl sm:text-5xl font-bold text-secondary mt-3 mb-5">Speakers & Panelists</h2>
              <p className="text-muted max-w-xl mx-auto">
                Learn from the brilliant minds shaping the future of technology and innovation
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {event.panelists.map((panelist) => (
                <SpeakerCard key={panelist.id} {...panelist} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ LOCATION ============ */}
      {event.latitude && event.longitude && (
        <section id="location" className="py-24 sm:py-32 bg-white relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">Where to Find Us</span>
              <h2 className="text-3xl sm:text-5xl font-bold text-secondary mt-3 mb-5">Event Location</h2>
              <p className="text-muted">
                Join us at the heart of {event.city}
              </p>
            </div>
            <EventMap
              latitude={event.latitude}
              longitude={event.longitude}
              venue={event.venue}
              address={event.address}
              city={event.city}
              country={event.country}
            />
          </div>
        </section>
      )}

      {/* ============ SPONSORS ============ */}
      {event.sponsors.length > 0 && (
        <section id="sponsors" className="py-24 sm:py-32 bg-background relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-semibold uppercase tracking-[0.15em]">Our Partners</span>
              <h2 className="text-3xl sm:text-5xl font-bold text-secondary mt-3 mb-5">Sponsors</h2>
              <p className="text-muted max-w-xl mx-auto">
                Proudly supported by world-class organizations
              </p>
            </div>

            <div className="space-y-14">
              {platinumSponsors.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 justify-center mb-6">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-200" />
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Platinum</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-200" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
                    {platinumSponsors.map((s) => <SponsorBadge key={s.id} {...s} />)}
                  </div>
                </div>
              )}
              {goldSponsors.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 justify-center mb-6">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-200" />
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Gold</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-200" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {goldSponsors.map((s) => <SponsorBadge key={s.id} {...s} />)}
                  </div>
                </div>
              )}
              {silverSponsors.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 justify-center mb-6">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-200" />
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Silver</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-200" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                    {silverSponsors.map((s) => <SponsorBadge key={s.id} {...s} />)}
                  </div>
                </div>
              )}
              {bronzeSponsors.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 justify-center mb-6">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-200" />
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Bronze</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-200" />
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
                    {bronzeSponsors.map((s) => <SponsorBadge key={s.id} {...s} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA ============ */}
      <section className="relative py-28 overflow-hidden bg-secondary noise-overlay">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to <span className="text-gradient">Join Us</span>?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Don&apos;t miss this opportunity. Secure your spot now and be part of an unforgettable experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary px-9 py-4 text-base inline-flex items-center justify-center gap-2.5">
              <Sparkles className="w-4 h-4" /> Register Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/badge" className="btn-secondary px-9 py-4 text-base inline-flex items-center justify-center">
              Get Your Badge
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
