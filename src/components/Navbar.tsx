"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { t } from "@/lib/i18n";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

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

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"}`}>
          <div className="bg-background border border-border p-4 space-y-2">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-foreground hover:text-primary transition-all duration-200 text-xs font-medium uppercase tracking-wider"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-foreground hover:text-primary transition-all duration-200 text-xs font-medium uppercase tracking-wider"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              )
            )}
            <div className="pt-4 mt-4 border-t border-border">
              <Link
                href={ctaHref}
                className="btn-primary w-full py-3 text-xs uppercase tracking-wider text-center block"
                onClick={() => setIsOpen(false)}
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
