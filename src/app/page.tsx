import Link from "next/link";
import { ArrowRight, Sparkles, Users, MapPin, Mic, Factory, Briefcase, Handshake, Network, GraduationCap, Monitor, Building2, Wrench, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventsSection from "@/components/EventsSection";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const AVATAR_COLORS = ["#ff7a00", "#3b82f6", "#10b981", "#8b5cf6"];

// Icon + colour for each event type value stored in DB
const TYPE_META: Record<string, { Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>, color: string, bg: string, label: string }> = {
  CONFERENCE:        { Icon: Mic,       color: "#3b82f6", bg: "rgba(59,130,246,0.08)",   label: "Conférence" },
  TRAINING_SEMINAR:  { Icon: GraduationCap, color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  label: "Séminaire / Formation" },
  WEBINAR:           { Icon: Monitor,   color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",   label: "Webinaire" },
  FORUM:             { Icon: Building2, color: "#14b8a6", bg: "rgba(20,184,166,0.08)",   label: "Forum / Salon" },
  WORKSHOP:          { Icon: Wrench,    color: "#f97316", bg: "rgba(249,115,22,0.08)",   label: "Atelier" },
  NETWORKING:        { Icon: Network,   color: "#10b981", bg: "rgba(16,185,129,0.08)",   label: "Networking" },
  INDUSTRIEL:        { Icon: Factory,   color: "#64748b", bg: "rgba(100,116,139,0.08)",  label: "Industriel" },
  MANAGEMENT:        { Icon: Briefcase, color: "#0ea5e9", bg: "rgba(14,165,233,0.08)",   label: "Management" },
  RELATION_CLIENTS:  { Icon: Handshake, color: "#ef4444", bg: "rgba(239,68,68,0.08)",    label: "Relation clients" },
  OTHER:             { Icon: Calendar,  color: "#94a3b8", bg: "rgba(148,163,184,0.08)",  label: "Autre" },
};

// Fallback categories if DB has no events yet
const FALLBACK_TYPES = ["CONFERENCE", "TRAINING_SEMINAR", "FORUM", "MANAGEMENT", "INDUSTRIEL", "RELATION_CLIENTS"];

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

  // Distinct eventTypes present in DB, ordered by count
  const rawTypes = await prisma.event.groupBy({
    by: ["eventType"],
    where: { isPublished: true },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const categoryTypes: string[] =
    rawTypes.length > 0
      ? rawTypes.map((r) => r.eventType as string)
      : FALLBACK_TYPES;

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
      <section
        className="relative flex flex-col overflow-hidden"
        style={{ minHeight: "100svh", background: "var(--background)" }}
      >
        {/* Right-side photo (desktop only) */}
        <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-[52%] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1559223607-a43c990c692c?w=1400&q=80&auto=format&fit=crop"
            alt="Professional conference in Africa"
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Fade so left text stays on clean white */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, var(--background) 0%, transparent 30%)" }}
          />
        </div>

        {/* Mobile full-bleed photo with strong overlay */}
        <div className="lg:hidden absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1559223607-a43c990c692c?w=900&q=70&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "rgba(10,15,30,0.75)" }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full py-28 lg:py-24">
            <div className="max-w-[580px]">
              {/* Pill */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold"
                style={{
                  background: "rgba(255,122,0,0.12)",
                  border: "1px solid rgba(255,122,0,0.28)",
                  color: "var(--primary)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                La plateforme pro d&apos;événements en Afrique ✨
              </div>

              <h1
                className="font-black leading-[1.05] tracking-tight mb-6 text-white lg:text-gray-900 lg:dark:text-white"
                style={{ fontSize: "clamp(2.8rem, 5.5vw, 4.8rem)" }}
              >
                Là où les idées
                <br />
                <span style={{ color: "var(--primary)" }}>deviennent</span> de vrais
                <br />
                événements.
              </h1>

              <p className="text-lg leading-relaxed mb-10 font-light max-w-[440px] text-white/80 lg:text-gray-600 lg:dark:text-gray-300">
                Découvrez et participez aux événements professionnels organisés par Qualivoire — conférences, séminaires, forums et ateliers en Afrique.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#events"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "var(--primary)" }}
                >
                  Explorer les événements <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href="/host"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm border-2 transition-all text-white border-white/40 hover:bg-white/10 lg:border-gray-300 lg:dark:border-slate-600 lg:text-gray-800 lg:dark:text-white lg:hover:bg-gray-50 lg:dark:hover:bg-slate-800"
                >
                  <Sparkles className="w-4 h-4" /> Organiser un événement
                </Link>
              </div>

              {/* Social proof */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {AVATAR_COLORS.map((color, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: color, borderColor: "rgba(255,255,255,0.3)" }}
                    >
                      {["A", "B", "C", "D"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white/70 lg:text-gray-600 lg:dark:text-gray-400">
                  <span className="font-bold text-white lg:text-gray-900 lg:dark:text-white">
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
              { value: `${(289723 + totalSubscribers).toLocaleString("fr-FR")}+`, label: "Participants" },
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
            <a
              href="#events"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryTypes.map((typeKey) => {
              const meta = TYPE_META[typeKey] ?? TYPE_META["OTHER"];
              const { Icon, color, bg, label } = meta;
              return (
                <a
                  key={typeKey}
                  href="#events"
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl text-center transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer border"
                  style={{ background: bg, borderColor: `${color}20` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}18` }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
                </a>
              );
            })}
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
              Pourquoi Qualivoire Connect ?
            </div>
            <h2 className="font-black text-4xl sm:text-5xl leading-tight" style={{ color: "var(--foreground)" }}>
              Votre expérience,<br />sans friction
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                Icon: Users,
                title: "Inscription en 2 min",
                desc: "Réservez votre place en quelques clics et recevez votre confirmation instantanément par email.",
              },
              {
                Icon: MapPin,
                title: "Votre badge digital",
                desc: "Accédez à l'événement avec votre QR code personnel — aucune file d'attente, aucun papier.",
              },
              {
                Icon: Sparkles,
                title: "Invitations exclusives",
                desc: "Recevez des invitations personnalisées aux événements qui correspondent à votre profil professionnel.",
              },
              {
                Icon: ArrowRight,
                title: "Toujours informé",
                desc: "Soyez le premier à connaître les prochains événements, programmes et intervenants.",
              },
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
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)", transform: "translate(25%, -35%)" }}
            />
            <div
              className="absolute bottom-0 left-12 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)", transform: "translateY(40%)" }}
            />
            <div className="relative z-10 px-8 py-12 sm:px-14 sm:py-14 flex flex-col sm:flex-row items-start sm:items-center gap-8 justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Pour les partenaires Qualivoire</p>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
                  Organisez votre<br />propre événement
                </h2>
                <p className="text-white/80 max-w-md">
                  Inscription, badges QR, invitations, newsletters — tous les outils en une seule plateforme. Réservé aux partenaires Qualivoire.
                </p>
              </div>
              <Link
                href="/host"
                className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm bg-white transition-all hover:bg-gray-50 hover:scale-105 active:scale-100 shadow-lg"
                style={{ color: "var(--primary)" }}
              >
                Faire une demande <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
