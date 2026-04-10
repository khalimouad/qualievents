import { prisma } from "@/lib/prisma";
import { Users, UserCheck, QrCode, Mail, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: { subscribers: true, panelists: true, badges: true, invitations: true, newsletters: true },
      },
    },
    orderBy: { date: "desc" },
  });

  const totalSubscribers = events.reduce((sum, e) => sum + e._count.subscribers, 0);
  const totalPanelists = events.reduce((sum, e) => sum + e._count.panelists, 0);
  const totalBadges = events.reduce((sum, e) => sum + e._count.badges, 0);
  const totalInvitations = events.reduce((sum, e) => sum + e._count.invitations, 0);

  const scannedBadges = await prisma.badge.count({ where: { isScanned: true } });

  const stats = [
    { label: "Total Subscribers", value: totalSubscribers, icon: Users, color: "bg-blue-500", href: "/admin/subscribers" },
    { label: "Panelists", value: totalPanelists, icon: UserCheck, color: "bg-purple-500", href: "/admin/panelists" },
    { label: "Badges Issued", value: totalBadges, icon: QrCode, color: "bg-green-500", href: "/admin/scan" },
    { label: "Badges Scanned", value: scannedBadges, icon: TrendingUp, color: "bg-orange-500", href: "/admin/scan" },
    { label: "Invitations Sent", value: totalInvitations, icon: Mail, color: "bg-pink-500", href: "/admin/invitations" },
    { label: "Events", value: events.length, icon: Calendar, color: "bg-indigo-500", href: "/admin" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your events and attendees</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-secondary mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl group-hover:scale-110 transition`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Events List */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-secondary mb-4">Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No events yet. Seed the database to get started.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-secondary">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      - {event.venue}, {event.city}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-600">{event._count.subscribers} subscribers</span>
                    <span className="text-purple-600">{event._count.panelists} speakers</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${event.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {event.isPublished ? "Published" : "Draft"}
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
