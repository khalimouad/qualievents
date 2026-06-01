import Link from "next/link";
import { Users, ArrowRight, Sparkles, MapPin, Cpu, Briefcase, Music, Network, Gamepad2, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventsSection from "@/components/EventsSection";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { Icon: Cpu, label: "Tech & Innovation", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  { Icon: Briefcase, label: "Business", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  { Icon: Music, label: "Musique & Arts", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  { Icon: Network, label: "Networking", color: "#f97316", bg: "rgba(249,115,22,0.08)" },
  { Icon: Gamepad2, label: "Gaming", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  { Icon: GraduationCap, label: "Éducation", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
];

const AVATAR_COLORS = ["#ff7a00", "#3b82f6", "#10b981", "#8b5cf6"];

export default async function HomePage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: { _count: { select: { subscribers: true, panelists: true } } },
    orderBy: { date: "asc" },
  });

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const ongoingEvents = events.filter((e) => {
    const start = new Date(e.date);
    if (start > now) return false;
    if (e.endDate) return new Date(e.endDate) >= now;
    return start >= todayStart;
  });

  const upcomingEvents = events.filter((e) => new Date(e.date) > now);

  const pastEvents = events.filter((e) => {
    const start = new Date(e.date);
    if (start > now) return false;
    if (e.endDate) return new Date(e.endDate) < now;
    return start < todayStart;
  });

  const totalSubscribers = events.reduce((s, e) => s + e._count.subscribers, 0);
  const citiesCount = new Set(events.map((e) => e.city).filter(Boolean)).size;

  const eventCards = (list: typeof events) =>
    list.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      tagline: e.tagline,
      description: e.description,
      date: e.date.toISOString(),
      themeColor: e.themeColor,
      heroImage: e.heroImage,
      city: e.city,
      format: e.format,
      maxAttendees: e.maxAttendees,
      subscribersCount: e._count.subscribers,
      panelistsCount: e._count.panelists,
    }));

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[100svh] flex flex-col overflow-hidden" style={{ background: "var(--background)" }}>
        {/* Right-side photo — hidden on mobile */}
        <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-[52%] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1400&q=80&auto=format&fit=crop"
            alt="Concert event hall"
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Left-side fade so text stays readable */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, var(--background) 0%, transparent 35%)" }}
          />
          {/* Subtle dark vignette bottom */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Mobile background photo */}
        <div className="lg:hidden absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=70&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)" }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full py-28 lg:py-24">
            <div className="max-w-[580px]">
              {/* Pill badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold"
                style={{
                  background: "rgba(255,122,0,0.12)",
                  border: "1px solid rgba(255,122,0,0.25)",
                  color: "var(--primary)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                L&apos;avenir des événements est là ✨
              </div>

              {/* Heading */}
              <h1
                className="font-black leading-[1.05] tracking-tight mb-6 lg:text-gray-900 lg:dark:text-white text-white"
                style={{ fontSize: "clamp(2.8rem, 5.5vw, 4.8rem)" }}
              >
                Là où les idées
                <br />
                <span style={{ color: "var(--primary)" }}>deviennent</span> de vrais
                <br />
                événements.
              </h1>

              <p
                className="text-lg leading-relaxed mb-10 font-light max-w-[440px] lg:text-gray-600 lg:dark:text-gray-300 text-white/85"
              >
                Découvrez, rejoignez et organisez des événements extraordinaires. Votre prochaine grande expérience commence ici.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#events"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "var(--primary)" }}
                >
                  Explorer les événements <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#host"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm border-2 transition-all hover:bg-white/10 lg:hover:bg-gray-50 lg:dark:hover:bg-slate-800 lg:border-gray-300 lg:dark:border-slate-600 lg:text-gray-800 lg:dark:text-white border-white/50 text-white"
                >
                  <Sparkles className="w-4 h-4" /> Organiser un événement
                </a>
              </div>

              {/* Social proof */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {AVATAR_COLORS.map((color, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: color, borderColor: "var(--background)" }}
                    >
                      {["A", "B", "C", "D"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm lg:text-gray-600 lg:dark:text-gray-400 text-white/80">
                  <span className="font-bold lg:text-gray-900 lg:dark:text-white text-white">
                    {totalSubscribers > 0 ? `${totalSubscribers.toLocaleString("fr-FR")}+` : "Des milliers de"}
                  </span>{" "}
                  participants nous font confiance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="relative z-20 border-t"
          style={{ background: "var(--background)", borderColor: "var(--border)" }}
        >
          <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: `${Math.max(events.length, 12)}+`, label: "Événements" },
              { value: totalSubscribers > 0 ? `${totalSubscribers.toLocaleString("fr-FR")}+` : "1 000+", label: "Participants" },
              { value: `${Math.max(citiesCount, 8)}+`, label: "Villes" },
              { value: "98%", label: "Satisfaction" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black" style={{ color: "var(--primary)" }}>{value}</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: "var(--muted)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <EventsSection
        ongoingEvents={eventCards(ongoingEvents)}
        upcomingEvents={eventCards(upcomingEvents)}
        pastEvents={eventCards(pastEvents)}
      />

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-20 border-b" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-wider"
                style={{ background: "var(--gold-dim)", color: "var(--primary)" }}
              >
                Catégories
              </div>
              <h2 className="text-3xl sm:text-4xl font-black" style={{ color: "var(--foreground)" }}>
                Parcourir par thème
              </h2>
            </div>
            <a href="#events" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80" style={{ color: "var(--primary)" }}>
              Voir tout <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ Icon, label, color, bg }) => (
              <a
                key={label}
                href="#events"
                className="flex flex-col items-center gap-3 p-5 rounded-2xl text-center transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer border"
                style={{ background: bg, borderColor: `${color}20` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 border-b" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14 max-w-lg">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-bold uppercase tracking-wider"
              style={{ background: "var(--gold-dim)", color: "var(--primary)" }}
            >
              Plateforme
            </div>
            <h2 className="font-black text-4xl sm:text-5xl leading-tight" style={{ color: "var(--foreground)" }}>
              Tout ce qu&apos;il vous faut
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { Icon: Users, title: "Inscription", desc: "Formulaires multi-étapes avec validation en temps réel et gestion de la capacité." },
              { Icon: MapPin, title: "Badges QR", desc: "Codes QR générés automatiquement pour un check-in fluide à l'événement." },
              { Icon: Sparkles, title: "Invitations", desc: "Invitations par email et SMS avec suivi en masse." },
              { Icon: ArrowRight, title: "Newsletters", desc: "Composez et envoyez des mises à jour à tous vos abonnés." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="group">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110"
                  style={{ background: "var(--gold-dim)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "var(--primary)" }} />
                </div>
                <h3 className="font-black text-lg mb-2 group-hover:text-primary transition-colors" style={{ color: "var(--foreground)" }}>{title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOST CTA ── */}
      <section id="host" className="py-20 border-b" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, #ff7a00 0%, #e54400 100%)" }}
          >
            {/* Decorative circles */}
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                transform: "translate(25%, -35%)",
              }}
            />
            <div
              className="absolute bottom-0 left-12 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
                transform: "translateY(40%)",
              }}
            />

            <div className="relative z-10 px-8 py-12 sm:px-14 sm:py-14 flex flex-col sm:flex-row items-start sm:items-center gap-8 justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Pour les organisateurs</p>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
                  Organisez votre<br />propre événement
                </h2>
                <p className="text-white/80 max-w-md">
                  Inscription, badges QR, invitations, newsletters — tous les outils en une seule plateforme.
                </p>
              </div>
              <Link
                href="/admin"
                className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm bg-white transition-all hover:bg-gray-50 hover:scale-105 active:scale-100 shadow-lg"
                style={{ color: "var(--primary)" }}
              >
                Commencer maintenant <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
