"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-dark shadow-lg py-2" : "bg-transparent py-3.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300">
                <span className="text-white font-bold text-base">Q</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base leading-none tracking-tight">
                Quali<span className="text-primary">Events</span>
              </span>
              <span className="text-[9px] text-gray-400 uppercase tracking-[0.18em] leading-none mt-0.5 hidden sm:block">
                Premium Events
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-end">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3.5 py-1.5 text-[13px] text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5 group font-medium"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-5 transition-all duration-300" />
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative px-3.5 py-1.5 text-[13px] text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5 group font-medium"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-5 transition-all duration-300" />
                </a>
              )
            )}

            <div className="w-px h-5 bg-white/10 mx-2" />

            <Link
              href={ctaHref}
              className="btn-primary ml-2 px-4 py-2 text-[12px] inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              {ctaLabel}
            </Link>
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-1">
            <button
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "top-2.5 rotate-45" : "top-1"}`} />
                <span className={`absolute left-0 top-2.5 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "opacity-0 scale-0" : "opacity-100"}`} />
                <span className={`absolute left-0 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "top-2.5 -rotate-45" : "top-4"}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
          <div className="glass rounded-2xl p-3 space-y-0.5">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              )
            )}
            <div className="pt-2">
              <Link
                href={ctaHref}
                className="btn-primary w-full py-2.5 text-sm text-center block"
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
