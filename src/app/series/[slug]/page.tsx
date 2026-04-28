import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, ArrowUpRight, Download, Globe, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = await prisma.eventSeries.findUnique({
    where: { slug },
    select: { title: true, description: true, heroImage: true },
  });
  if (!series) return { title: "Programme introuvable" };
  return {
    title: `${series.title} — QualiEvents`,
    description: series.description?.slice(0, 160),
    openGraph: {
      title: series.title,
      description: series.description?.slice(0, 200),
      images: series.heroImage ? [series.heroImage] : undefined,
    },
  };
}

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const series = await prisma.eventSeries.findUnique({
    where: { slug },
    include: {
      events: {
        where: { isPublished: true },
        orderBy: { date: "asc" },
        include: {
          ticketTiers: {
            where: { available: true },
            orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
          },
          _count: { select: { subscribers: true, panelists: true } },
        },
      },
    },
  });

  if (!series || !series.isPublished) notFound();

  const themeStyle = series.themeColor
    ? ({
        ["--primary" as string]: series.themeColor,
      } as React.CSSProperties)
    : undefined;

  return (
    <div style={themeStyle}>
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        {series.heroImage ? (
          <>
            <img src={series.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
          </>
        ) : (
          <div className="absolute inset-0 mesh-bg" />
        )}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 w-full text-center">
          <span className={`inline-block text-sm font-semibold uppercase tracking-[0.2em] mb-3 ${series.heroImage ? "text-white/85" : "text-primary"}`}>
            Programme
          </span>
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-serif font-medium mb-4 leading-tight ${series.heroImage ? "text-white" : "text-foreground"}`}
            style={series.heroImage ? { textShadow: "0 4px 32px rgba(0,0,0,0.7)" } : undefined}
          >
            {series.title}
          </h1>
          {series.description && (
            <p
              className={`max-w-2xl mx-auto leading-relaxed ${series.heroImage ? "text-white/95" : "text-text-secondary"}`}
              style={series.heroImage ? { textShadow: "0 2px 16px rgba(0,0,0,0.6)" } : undefined}
            >
              {series.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${series.heroImage ? "bg-white/15 backdrop-blur-xl border border-white/25 text-white" : "glass text-foreground"}`}>
              <Calendar className="w-4 h-4" /> {series.events.length} événement{series.events.length > 1 ? "s" : ""}
            </span>
            {series.brochureUrl && (
              <a
                href={series.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Télécharger la brochure
              </a>
            )}
          </div>
        </div>
      </section>

      {/* EVENT LIST */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          {series.events.length === 0 ? (
            <div className="card p-10 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-text-secondary opacity-60" />
              <p className="text-text-secondary">Les événements de ce programme seront annoncés prochainement.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {series.events.map((event) => {
                const tierPrices = event.ticketTiers.length
                  ? event.ticketTiers.map((t) => t.price)
                  : event.ticketPrice
                    ? [event.ticketPrice]
                    : [];
                const tierCurrency = event.ticketTiers[0]?.currency || event.currency;
                const minPrice = tierPrices.length ? Math.min(...tierPrices) : null;
                const eventDate = new Date(event.date);
                const isOnline = event.format === "ONLINE";
                const isHybrid = event.format === "HYBRID";

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-primary/40"
                  >
                    <div className="relative h-44 overflow-hidden bg-subtle flex-shrink-0">
                      {event.heroImage ? (
                        <img src={event.heroImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{
                            background: `linear-gradient(135deg, ${event.themeColor || "#ff7a00"}40, ${event.themeColor || "#009e60"}40)`,
                          }}
                        />
                      )}
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5"
                        style={{ background: event.themeColor || "linear-gradient(90deg, var(--primary), var(--accent))" }}
                      />
                      {(isOnline || isHybrid) && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-foreground">
                          {isOnline ? "🎥 En ligne" : "🎥 Hybride"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-text-secondary font-semibold mb-2">
                        {eventDate.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        {event.endDate ? ` → ${new Date(event.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : ""}
                      </p>
                      <h3 className="font-serif text-xl font-medium text-foreground mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      {event.tagline && (
                        <p className="text-sm text-primary/80 font-medium mb-3 line-clamp-1">{event.tagline}</p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-3 uppercase tracking-wider">
                        {isOnline ? (
                          <>
                            <Globe className="w-3.5 h-3.5 text-primary" />
                            <span>Visioconférence</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span className="truncate">{event.city}{event.country ? `, ${event.country}` : ""}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-end justify-between pt-3 border-t border-border mt-auto">
                        <div>
                          {minPrice !== null ? (
                            <>
                              <span className="text-[10px] uppercase tracking-wider text-text-secondary">À partir de</span>
                              <p className="text-lg font-bold text-primary tabular-nums">{formatPrice(minPrice, tierCurrency)}</p>
                            </>
                          ) : (
                            <span className="text-xs uppercase tracking-wider text-success font-semibold">Gratuit</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{event._count.subscribers}</span>
                          <ArrowUpRight className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
