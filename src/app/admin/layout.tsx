"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UserCheck, Mail, Send, QrCode, ArrowLeft, ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/panelists", label: "Panelists", icon: UserCheck },
  { href: "/admin/invitations", label: "Invitations", icon: Send },
  { href: "/admin/newsletters", label: "Newsletters", icon: Mail },
  { href: "/scan", label: "Scanner App", icon: QrCode },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-gray-100 hidden lg:flex flex-col">
        {/* Logo */}
        <div className="p-6 pb-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <div>
              <span className="text-secondary font-bold text-base">Quali<span className="text-primary">Events</span></span>
              <p className="text-[10px] text-muted uppercase tracking-widest">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          <p className="px-3 py-2 text-[10px] text-muted uppercase tracking-[0.15em] font-semibold">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/5 text-primary"
                    : "text-muted hover:bg-gray-50 hover:text-secondary"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? "bg-primary/10" : "bg-gray-50 group-hover:bg-gray-100"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary/50" />}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="p-4 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-2 text-muted hover:text-secondary text-sm transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-3.5">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white font-bold text-xs">Q</span>
            </div>
            <span className="font-bold text-secondary text-sm">Admin</span>
          </Link>
          <Link href="/" className="text-muted hover:text-secondary text-sm font-medium flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Site
          </Link>
        </div>
        <div className="flex overflow-x-auto px-3 pb-3 gap-1.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive ? "bg-primary/10 text-primary" : "bg-gray-50 text-muted"
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-5 lg:p-8 pt-[110px] lg:pt-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
