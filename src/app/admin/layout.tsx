"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, QrCode, ArrowLeft, ChevronRight, LogOut } from "lucide-react";
import { t } from "@/lib/i18n";

const navItems = [
  { href: "/admin", label: t.admin.dashboard, icon: LayoutDashboard },
  { href: "/scan", label: t.admin.scanner, icon: QrCode },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide the admin shell on /admin/login
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-[220px] bg-white border-r border-gray-100 hidden lg:flex flex-col">
        <div className="p-4 pb-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">Q</span>
            </div>
            <div>
              <span className="text-secondary font-bold text-sm">Quali<span className="text-primary">Events</span></span>
              <p className="text-[9px] text-muted uppercase tracking-widest">Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-2 py-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/admin" && pathname.startsWith("/admin/events"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive ? "bg-primary/5 text-primary" : "text-muted hover:bg-gray-50 hover:text-secondary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-primary/50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-2">
          <Link href="/" className="flex items-center gap-2 text-muted hover:text-secondary text-xs transition-colors px-1">
            <ArrowLeft className="w-3 h-3" /> {t.admin.backToSite}
          </Link>
          <button
            onClick={() => { fetch("/api/auth", { method: "DELETE" }).then(() => window.location.href = "/admin/login"); }}
            className="flex items-center gap-2 text-muted hover:text-danger text-xs transition-colors w-full px-1"
          >
            <LogOut className="w-3 h-3" /> {t.admin.logout}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">Q</span>
            </div>
            <span className="font-bold text-secondary text-xs">Admin</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="text-muted hover:text-secondary text-xs px-2">Site</Link>
            <button onClick={() => { fetch("/api/auth", { method: "DELETE" }).then(() => window.location.href = "/admin/login"); }} className="text-muted hover:text-danger p-1.5">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex px-3 pb-2 gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/admin" && pathname.startsWith("/admin/events"));
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${isActive ? "bg-primary/10 text-primary" : "bg-gray-50 text-muted"}`}>
                <Icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 p-4 lg:p-6 pt-[90px] lg:pt-6 overflow-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
