import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Users, UserCheck, Award, Send, Mail, TrendingUp } from "lucide-react";
import Link from "next/link";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function EventOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      _count: { select: { subscribers: true, panelists: true, sponsors: true, badges: true, invitations: true, newsletters: true } },
    },
  });

  if (!event) notFound();

  const scanned = await prisma.badge.count({ where: { eventId: event.id, isScanned: true } });
  const waitlisted = await prisma.subscriber.count({ where: { eventId: event.id, status: "waitlisted" } });
  const capacityPct = Math.round((event._count.subscribers / event.maxAttendees) * 100);

  const stats = [
    { label: t.admin.stats.subscribers, value: event._count.subscribers, max: event.maxAttendees, icon: Users, color: "from-blue-500 to-indigo-600", href: `/admin/events/${slug}/subscribers` },
    { label: t.admin.stats.checkedIn, value: scanned, max: event._count.badges, icon: TrendingUp, color: "from-emerald-500 to-green-600", href: `/admin/events/${slug}/subscribers` },
    { label: t.admin.stats.panelists, value: event._count.panelists, icon: UserCheck, color: "from-violet-500 to-purple-600", href: `/admin/events/${slug}/panelists` },
    { label: t.admin.sponsors, value: event._count.sponsors, icon: Award, color: "from-amber-500 to-orange-600", href: `/admin/events/${slug}/sponsors` },
    { label: t.admin.invitations, value: event._count.invitations, icon: Send, color: "from-pink-500 to-rose-600", href: `/admin/events/${slug}/invitations` },
    { label: t.admin.newsletters, value: event._count.newsletters, icon: Mail, color: "from-cyan-500 to-blue-600", href: `/admin/events/${slug}/newsletters` },
  ];

  return (
    <div>
      {/* Hero banner if image */}
      {event.heroImage && (
        <div className="card overflow-hidden mb-4">
          <img src={event.heroImage} alt="" className="w-full h-40 object-cover" />
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="card p-3 hover:border-primary/40 hover:shadow-md transition-all group">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-bold text-foreground leading-tight">
                {stat.value}
                {stat.max !== undefined && <span className="text-xs text-text-secondary font-normal">/{stat.max}</span>}
              </p>
              <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wider">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Capacity bar */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xs uppercase tracking-[0.15em] text-text-secondary font-semibold">{t.admin.capacity}</h2>
            <p className="text-sm text-foreground mt-0.5">
              <strong>{event._count.subscribers}</strong> / <strong>{event.maxAttendees}</strong> {t.admin.seatsFilled}
              {waitlisted > 0 && <span className="text-warning ml-2">· {waitlisted} {t.admin.onWaitlist}</span>}
            </p>
          </div>
          <span className={`text-lg font-bold ${capacityPct >= 100 ? "text-danger" : capacityPct >= 80 ? "text-warning" : "text-success"}`}>{capacityPct}%</span>
        </div>
        <div className="h-2 bg-subtle rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${capacityPct >= 100 ? "bg-danger" : capacityPct >= 80 ? "bg-warning" : "bg-gradient-to-r from-primary to-accent"}`}
            style={{ width: `${Math.min(capacityPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Event details */}
      <div className="card p-4">
        <h2 className="text-xs uppercase tracking-[0.15em] text-text-secondary font-semibold mb-3">{t.admin.details}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider">{t.admin.date}</p>
            <p className="text-foreground font-medium">{new Date(event.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider">{t.admin.venue}</p>
            <p className="text-foreground font-medium">{event.venue}</p>
            <p className="text-xs text-text-secondary">{event.address}, {event.city}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
