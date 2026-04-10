import { prisma } from "@/lib/prisma";
import { Users, UserCheck, QrCode, Mail, Calendar, TrendingUp, ArrowUpRight } from "lucide-react";
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
    { label: "Badges Scanned", value: scannedBadges, icon: TrendingUp, color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/15", href: "/admin/scan" },
    { label: "Invitations", value: totalInvitations, icon: Mail, color: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/15", href: "/admin/invitations" },
    { label: "Events", value: events.length, icon: Calendar, color: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/15", href: "/admin" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Overview of your events and attendees</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl p-5 border border-gray-100 card-hover group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className="text-2xl font-bold text-secondary">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Events */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-secondary">Events</h2>
          <span className="text-xs text-muted bg-gray-50 px-2.5 py-1 rounded-full">{events.length} total</span>
        </div>
        {events.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-muted text-sm">No events yet. Run the seed to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {events.map((event) => (
              <div key={event.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary text-sm">{event.title}</h3>
                      <p className="text-xs text-muted mt-0.5">
                        {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} &middot; {event.venue}, {event.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted"><span className="font-semibold text-secondary">{event._count.subscribers}</span> subscribers</span>
                    <span className="text-muted"><span className="font-semibold text-secondary">{event._count.panelists}</span> speakers</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${event.isPublished ? "bg-success/10 text-success" : "bg-gray-100 text-muted"}`}>
                      {event.isPublished ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
