"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, QrCode, ArrowLeft, ChevronRight, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
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
      <aside className="w-[240px] bg-card border-r border-border hidden lg:flex flex-col">
        <div className="p-5 pb-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <div>
              <span className="text-foreground font-bold text-sm">Quali<span className="text-primary">Events</span></span>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/admin" && pathname.startsWith("/admin/events"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-hover hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary/50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <div className="flex items-center justify-between px-2 py-1.5">
            <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-foreground text-xs transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> {t.admin.backToSite}
            </Link>
            <ThemeToggle />
          </div>
          <button
            onClick={() => { fetch("/api/auth", { method: "DELETE" }).then(() => window.location.href = "/admin/login"); }}
            className="flex items-center gap-2 text-text-secondary hover:text-danger text-xs transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-danger/5"
          >
            <LogOut className="w-3.5 h-3.5" /> {t.admin.logout}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">Q</span>
            </div>
            <span className="font-bold text-foreground text-sm">Admin</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-foreground hover:bg-hover rounded-lg transition-colors">Site</Link>
            <ThemeToggle />
            <button
              onClick={() => { fetch("/api/auth", { method: "DELETE" }).then(() => window.location.href = "/admin/login"); }}
              className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
              aria-label="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex px-4 pb-3 gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/admin" && pathname.startsWith("/admin/events"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive ? "bg-primary/10 text-primary border border-primary/20" : "bg-subtle text-text-secondary border border-border"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 p-4 lg:p-6 pt-[100px] lg:pt-6 overflow-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
