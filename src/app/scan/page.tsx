import Link from "next/link";
import { Calendar, MapPin, Users, Scan, ArrowLeft, QrCode } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ScanPickerPage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      _count: { select: { subscribers: true, badges: true } },
    },
    orderBy: { date: "asc" },
  });

  const scannedCounts = await prisma.badge.groupBy({
    by: ["eventId"],
    where: { isScanned: true },
    _count: true,
  });

  const scannedMap = Object.fromEntries(
    scannedCounts.map((s) => [s.eventId, s._count])
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;admin
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30">
            <Scan className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t.scanner.title}</h1>
            <p className="text-gray-400 text-sm">{t.scanner.selectEvent}</p>
          </div>
        </div>
      </header>

      {/* Events grid */}
      <main className="flex-1 px-6 py-6">
        {events.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">{t.scanner.noEvents}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {events.map((event) => {
              const scanned = scannedMap[event.id] || 0;
              return (
                <Link
                  key={event.id}
                  href={`/scan/${event.slug}`}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                  <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 group-hover:border-white/20">
                    {/* Color indicator */}
                    <div
                      className="w-2 h-2 rounded-full mb-4"
                      style={{ backgroundColor: event.themeColor || "#e94560" }}
                    />

                    <h3 className="font-bold text-white text-lg mb-1 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.date).toLocaleDateString("fr-FR", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.city}, {event.country}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>
                          <span className="text-white font-semibold">
                            {event._count.subscribers}
                          </span>{" "}
                          {t.scanner.registered}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Scan className="w-3 h-3" />
                        <span>
                          <span className="text-emerald-400 font-semibold">
                            {scanned}
                          </span>
                          /{event._count.badges} {t.scanner.scanned}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer hint */}
      <footer className="px-6 py-4 text-center">
        <p className="text-gray-600 text-xs">
          {t.scanner.addToHomeScreen}
        </p>
      </footer>
    </div>
  );
}
