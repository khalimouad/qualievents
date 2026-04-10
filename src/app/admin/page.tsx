import { prisma } from "@/lib/prisma";
import { Users, UserCheck, QrCode, Mail, Calendar, TrendingUp, Plus, ArrowUpRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const events = await prisma.event.findMany({
    include: {
      _count: { select: { subscribers: true, panelists: true, badges: true, invitations: true, newsletters: true } },
    },
    orderBy: { date: "desc" },
  });

  const totalSubscribers = events.reduce((sum, e) => sum + e._count.subscribers, 0);
  const totalPanelists = events.reduce((sum, e) => sum + e._count.panelists, 0);
  const totalBadges = events.reduce((sum, e) => sum + e._count.badges, 0);
  const totalInvitations = events.reduce((sum, e) => sum + e._count.invitations, 0);
  const scannedBadges = await prisma.badge.count({ where: { isScanned: true } });

  const stats = [
    { label: "Subscribers", value: totalSubscribers, icon: Users, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/15", href: "/admin/subscribers" },
    { label: "Panelists", value: totalPanelists, icon: UserCheck, color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/15", href: "/admin/panelists" },
    { label: "Badges Issued", value: totalBadges, icon: QrCode, color: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/15", href: "/admin/scan" },
    { label: "Scanned", value: scannedBadges, icon: TrendingUp, color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/15", href: "/admin/scan" },
    { label: "Invitations", value: totalInvitations, icon: Mail, color: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/15", href: "/admin/invitations" },
    { label: "Events", value: events.length, icon: Calendar, color: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/15", href: "/admin" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Manage all your events from one place</p>
        </div>
        <Link href="/admin/events/new" className="btn-primary px-5 py-2.5 text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-2xl p-5 border border-gray-100 card-hover group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className="text-2xl font-bold text-secondary">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-secondary">Events</h2>
        <span className="text-xs text-muted bg-gray-50 px-2.5 py-1 rounded-full">{events.length} total</span>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-muted text-sm mb-4">No events yet</p>
          <Link href="/admin/events/new" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover group">
              {/* Color bar */}
              <div className="h-1.5 bg-gradient-to-r from-primary to-accent" style={event.themeColor ? { background: `linear-gradient(90deg, ${event.themeColor}, ${event.themeColor}88)` } : undefined} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-secondary text-sm truncate">{event.title}</h3>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &middot; {event.city}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ml-2 ${event.isPublished ? "bg-success/10 text-success" : "bg-gray-100 text-muted"}`}>
                    {event.isPublished ? "Live" : "Draft"}
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-muted mb-4">
                  <span>{event._count.subscribers} subscribers</span>
                  <span>{event._count.panelists} speakers</span>
                  <span>{event._count.badges} badges</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                  {event.isPublished && (
                    <Link href={`/events/${event.slug}`} className="flex items-center gap-1 text-xs text-muted hover:text-primary font-medium transition-colors" target="_blank">
                      <ExternalLink className="w-3 h-3" /> View Page
                    </Link>
                  )}
                  <div className="flex-1" />
                  <Link href={`/admin/subscribers?eventId=${event.id}`} className="text-xs text-muted hover:text-secondary font-medium transition-colors">Subscribers</Link>
                  <Link href={`/admin/panelists?eventId=${event.id}`} className="text-xs text-muted hover:text-secondary font-medium transition-colors">Speakers</Link>
                </div>
              </div>
            </div>
          ))}

          {/* Create new card */}
          <Link href="/admin/events/new" className="border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-12 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors group">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-3 transition-colors">
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-medium text-muted group-hover:text-primary transition-colors">Create Event</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
