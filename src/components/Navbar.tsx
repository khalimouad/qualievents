"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { t } from "@/lib/i18n";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const eventSlugMatch = pathname.match(/^\/events\/([^/]+)/);
  const isEventPage = !!eventSlugMatch && !pathname.includes("/register") && !pathname.includes("/badge");
  const eventSlug = eventSlugMatch?.[1];
  const isHomePage = pathname === "/";

  const publicNavLinks = [
    { href: "/#events", label: "Événements" },
    { href: "/#categories", label: "Catégories" },
    { href: "/#host", label: "Organiser" },
    { href: "/#about", label: "À propos" },
  ];

  const eventNavLinks = [
    { href: "#about", label: t.nav.about },
    { href: "#speakers", label: t.nav.speakers },
    { href: "#location", label: t.nav.location },
    { href: "#sponsors", label: t.nav.sponsors },
  ];

  const navLinks = isEventPage ? eventNavLinks : publicNavLinks;

  // Event pages: transparent navbar over dark hero → white text
  // Homepage: always opaque white navbar → dark text (photo bleeds into nav zone)
  // Scrolled: always opaque white
  const isLight = !scrolled && isEventPage;
  const navOpaque = scrolled || !isEventPage;

  const linkClass = isLight
    ? "text-white/85 hover:text-white"
    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white";

  // Mobile hamburger/search: white text only on event pages (dark hero)
  const mobileIconClass = isLight
    ? "text-white hover:bg-white/10"
    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        navOpaque
          ? scrolled
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3 shadow-sm"
            : "bg-white dark:bg-slate-900 py-4"
          : "bg-transparent border-transparent py-5"
      }`}
      style={{ borderColor: navOpaque ? "var(--border)" : "transparent" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <span className="logo-dot" />
            <span
              className={`font-serif font-black text-[1.15rem] leading-none tracking-tight transition-colors ${
                isLight ? "text-white" : "text-foreground"
              }`}
            >
              QualiEvents
            </span>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: "var(--primary)" }}
            >
              2026
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            {navLinks.map((link) =>
              link.href.startsWith("/") || link.href.startsWith("#") ? (
                link.href.startsWith("/") ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${linkClass}`}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${linkClass}`}
                  >
                    {link.label}
                  </a>
                )
              ) : null
            )}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <button
              className={`p-2 rounded-lg transition-colors ${
                isLight
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800"
              }`}
              aria-label="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>

            <ThemeToggle />

            {isEventPage ? (
              <>
                <div className={`w-px h-4 mx-1 ${isLight ? "bg-white/30" : "bg-gray-200 dark:bg-slate-700"}`} />
                <Link
                  href={`/events/${eventSlug}/register`}
                  className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider inline-flex items-center gap-2 font-bold"
                >
                  {t.nav.registerNow} <ArrowRight className="w-3 h-3" />
                </Link>
              </>
            ) : (
              <>
                <div className="w-px h-4 mx-1 bg-gray-200 dark:bg-slate-700" />
                <Link
                  href="/admin"
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Connexion
                </Link>
                <a
                  href="/#host"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white inline-flex items-center gap-1.5 transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "var(--primary)" }}
                >
                  Organiser <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </>
            )}
          </div>

          {/* Mobile: search + hamburger */}
          <div className="md:hidden flex items-center gap-1 ml-auto">
            <button
              className={`p-2 rounded-lg transition-colors ${isLight ? "text-white/70 hover:bg-white/10" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"}`}
              aria-label="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              className={`relative w-9 h-9 flex items-center justify-center transition-colors rounded-lg ${mobileIconClass}`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 w-5 h-px transition-all duration-300 ${isLight ? "bg-white" : "bg-foreground"} ${isOpen ? "top-2.5 rotate-45" : "top-1"}`} />
                <span className={`absolute left-0 top-2.5 w-5 h-px transition-all duration-300 ${isLight ? "bg-white" : "bg-foreground"} ${isOpen ? "opacity-0 scale-0" : "opacity-100"}`} />
                <span className={`absolute left-0 w-5 h-px transition-all duration-300 ${isLight ? "bg-white" : "bg-foreground"} ${isOpen ? "top-2.5 -rotate-45" : "top-4"}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mounted && createPortal(
        <div
          className={`fixed inset-0 z-[100] md:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!isOpen}
        >
          <div
            onClick={() => setIsOpen(false)}
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5">
                <span className="logo-dot" />
                <span className="font-serif font-black text-[1.1rem] leading-none tracking-tight text-foreground">
                  QualiEvents
                </span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fermer le menu"
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) =>
                  link.href.startsWith("/") ? (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-3 text-foreground hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-semibold"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-3 text-foreground hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-semibold"
                    >
                      {link.label}
                    </a>
                  )
                )}
              </div>
            </nav>

            <div className="px-5 py-5 border-t border-border space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted font-medium">Thème</span>
                <ThemeToggle />
              </div>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 text-sm font-semibold text-center border border-border rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors block text-foreground"
              >
                Connexion
              </Link>
              <a
                href="/#host"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 text-sm font-bold text-white text-center rounded-xl transition-all hover:opacity-90 block"
                style={{ background: "var(--primary)" }}
              >
                Organiser un événement
              </a>
            </div>
          </aside>
        </div>,
        document.body
      )}
    </nav>
  );
}
