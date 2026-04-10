"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine if we're on an event page
  const eventSlugMatch = pathname.match(/^\/events\/([^/]+)/);
  const isEventPage = !!eventSlugMatch && !pathname.includes("/register") && !pathname.includes("/badge");
  const eventSlug = eventSlugMatch?.[1];

  const navLinks = isEventPage
    ? [
        { href: "#about", label: "About" },
        { href: "#speakers", label: "Speakers" },
        { href: "#location", label: "Location" },
        { href: "#sponsors", label: "Sponsors" },
      ]
    : [
        { href: "/#events", label: "Events" },
        { href: "/admin", label: "Dashboard" },
      ];

  const registerHref = isEventPage ? `/events/${eventSlug}/register` : "/#events";
  const registerLabel = isEventPage ? "Register Now" : "Explore Events";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-dark shadow-lg py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight tracking-tight">
                Quali<span className="text-primary">Events</span>
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] leading-none hidden sm:block">
                Premium Events
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link key={link.href} href={link.href} className="relative px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors duration-300 rounded-lg hover:bg-white/5 group">
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-6 transition-all duration-300" />
                </Link>
              ) : (
                <a key={link.href} href={link.href} className="relative px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors duration-300 rounded-lg hover:bg-white/5 group">
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-6 transition-all duration-300" />
                </a>
              )
            )}
            <div className="w-px h-6 bg-white/10 mx-3" />
            <Link href={registerHref} className="btn-primary px-5 py-2.5 text-sm inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> {registerLabel}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="relative w-5 h-5">
              <span className={`absolute left-0 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "top-2.5 rotate-45" : "top-1"}`} />
              <span className={`absolute left-0 top-2.5 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "opacity-0 scale-0" : "opacity-100"}`} />
              <span className={`absolute left-0 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? "top-2.5 -rotate-45" : "top-4"}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? "max-h-80 opacity-100 mt-4" : "max-h-0 opacity-0"}`}>
          <div className="glass rounded-2xl p-4 space-y-1">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link key={link.href} href={link.href} className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 text-sm font-medium" onClick={() => setIsOpen(false)}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href} className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 text-sm font-medium" onClick={() => setIsOpen(false)}>
                  {link.label}
                </a>
              )
            )}
            <div className="pt-2">
              <Link href={registerHref} className="btn-primary w-full py-3 text-sm text-center block" onClick={() => setIsOpen(false)}>
                {registerLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
