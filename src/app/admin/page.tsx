import { prisma } from "@/lib/prisma";
import { Users, UserCheck, QrCode, Mail, Calendar, TrendingUp, Plus, ArrowUpRight } from "lucide-react";
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
    { label: "Events", value: events.length, icon: Calendar, color: "from-cyan-500 to-blue-600" },
    { label: "Subscribers", value: totalSubscribers, icon: Users, color: "from-blue-500 to-indigo-600" },
    { label: "Panelists", value: totalPanelists, icon: UserCheck, color: "from-violet-500 to-purple-600" },
    { label: "Badges", value: totalBadges, icon: QrCode, color: "from-emerald-500 to-green-600" },
    { label: "Scanned", value: scannedBadges, icon: TrendingUp, color: "from-amber-500 to-orange-600" },
    { label: "Invites", value: totalInvitations, icon: Mail, color: "from-pink-500 to-rose-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-secondary">Dashboard</h1>
          <p className="text-muted text-xs mt-0.5">Overview of all events</p>
        </div>
        <Link href="/admin/events/new" className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          <Plus className="w-3 h-3" /> New Event
        </Link>
      </div>

      {/* Stats - condensed */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-3 border border-gray-100">
              <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${stat.color} flex items-center justify-center mb-1.5 shadow-sm`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-lg font-bold text-secondary leading-none">{stat.value}</p>
              <p className="text-[9px] text-muted mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold">Events</h2>
        <span className="text-[10px] text-muted">{events.length} total</span>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-200" />
          <p className="text-muted text-xs mb-3">No events yet</p>
          <Link href="/admin/events/new" className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> Create First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.slug}`}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              {/* Hero image or color bar */}
              {event.heroImage ? (
                <div className="h-20 overflow-hidden">
                  <img src={event.heroImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-1" style={event.themeColor ? { background: `linear-gradient(90deg, ${event.themeColor}, ${event.themeColor}88)` } : { background: "linear-gradient(90deg, #e94560, #0f3460)" }} />
              )}

              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-secondary text-sm truncate group-hover:text-primary transition-colors">{event.title}</h3>
                    <p className="text-[11px] text-muted mt-0.5">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {event.city}
                    </p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider flex-shrink-0 ${event.isPublished ? "bg-success/10 text-success" : "bg-gray-100 text-muted"}`}>
                    {event.isPublished ? "Live" : "Draft"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-[10px] text-muted">
                    <span><strong className="text-secondary">{event._count.subscribers}</strong> subs</span>
                    <span><strong className="text-secondary">{event._count.panelists}</strong> pan</span>
                    <span><strong className="text-secondary">{event._count.badges}</strong> bdg</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}

          <Link href="/admin/events/new" className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-8 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors group">
            <div className="text-center">
              <div className="w-8 h-8 rounded-md bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-1.5 transition-colors">
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs font-medium text-muted group-hover:text-primary transition-colors">Create Event</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
