"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
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

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // Determine context
  const eventSlugMatch = pathname.match(/^\/events\/([^/]+)/);
  const isEventPage = !!eventSlugMatch && !pathname.includes("/register") && !pathname.includes("/badge");
  const eventSlug = eventSlugMatch?.[1];

  const navLinks = isEventPage
    ? [
        { href: "#about", label: t.nav.about },
        { href: "#speakers", label: t.nav.speakers },
        { href: "#location", label: t.nav.location },
        { href: "#sponsors", label: t.nav.sponsors },
      ]
    : [
        { href: "/#events", label: t.nav.events },
        { href: "/admin", label: t.nav.dashboard },
      ];

  const ctaHref = isEventPage ? `/events/${eventSlug}/register` : "/#events";
  const ctaLabel = isEventPage ? t.nav.registerNow : t.nav.exploreEvents;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "card-glass border-b border-border py-3 shadow-lg"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className={`w-8 h-8 flex items-center justify-center ${isEventPage && !scrolled ? "bg-white" : "bg-foreground"}`}>
              <span className={`font-serif font-bold text-lg leading-none ${isEventPage && !scrolled ? "text-black" : "text-background"}`}>Q</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-serif font-medium text-lg leading-none tracking-tight ${isEventPage && !scrolled ? "text-white" : "text-foreground"}`}>
                Quali<i className={`opacity-90 ${isEventPage && !scrolled ? "text-primary-light" : "text-primary"}`}>Events</i>
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`link-spell text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                    isEventPage && !scrolled
                      ? "text-white/85 hover:text-white"
                      : "text-text-secondary hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className={`link-spell text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                    isEventPage && !scrolled
                      ? "text-white/85 hover:text-white"
                      : "text-text-secondary hover:text-foreground"
                  }`}
                >
                  {link.label}
                </a>
              )
            )}

            <div className={`w-px h-4 mx-2 ${isEventPage && !scrolled ? "bg-white/30" : "bg-border"}`} />

            <ThemeToggle />

            <Link
              href={ctaHref}
              className="btn-primary hover-spell ml-2 px-5 py-2.5 text-[10px] uppercase tracking-wider inline-flex items-center gap-2"
            >
              {ctaLabel} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className={`relative w-9 h-9 flex items-center justify-center transition-colors ${isEventPage && !scrolled ? "text-white hover:bg-white/10" : "text-foreground hover:bg-hover"}`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 w-5 h-px transition-all duration-300 ${isEventPage && !scrolled ? "bg-white" : "bg-foreground"} ${isOpen ? "top-2.5 rotate-45" : "top-1"}`} />
                <span className={`absolute left-0 top-2.5 w-5 h-px transition-all duration-300 ${isEventPage && !scrolled ? "bg-white" : "bg-foreground"} ${isOpen ? "opacity-0 scale-0" : "opacity-100"}`} />
                <span className={`absolute left-0 w-5 h-px transition-all duration-300 ${isEventPage && !scrolled ? "bg-white" : "bg-foreground"} ${isOpen ? "top-2.5 -rotate-45" : "top-4"}`} />
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Mobile drawer — portaled to body so it sits above everything,
          slides in from the right, with a backdrop. */}
      {mounted && createPortal(
        <div
          className={`fixed inset-0 z-[100] md:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!isOpen}
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Drawer panel */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-foreground">
                  <span className="font-serif font-bold text-lg leading-none text-background">Q</span>
                </div>
                <span className="font-serif font-medium text-lg leading-none tracking-tight text-foreground">
                  Quali<i className="opacity-90 text-primary">Events</i>
                </span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fermer le menu"
                className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-foreground hover:bg-hover rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer links */}
            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) =>
                  link.href.startsWith("/") ? (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-3 text-foreground hover:text-primary hover:bg-hover rounded-lg transition-colors text-sm font-semibold uppercase tracking-[0.1em]"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-3 text-foreground hover:text-primary hover:bg-hover rounded-lg transition-colors text-sm font-semibold uppercase tracking-[0.1em]"
                    >
                      {link.label}
                    </a>
                  )
                )}
              </div>
            </nav>

            {/* Drawer footer with CTA */}
            <div className="px-5 py-5 border-t border-border">
              <Link
                href={ctaHref}
                onClick={() => setIsOpen(false)}
                className="btn-primary w-full py-3 text-xs uppercase tracking-wider text-center inline-flex items-center justify-center gap-2"
              >
                {ctaLabel} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </aside>
        </div>,
        document.body
      )}
    </nav>
  );
}
