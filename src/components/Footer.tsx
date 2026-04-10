import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-secondary overflow-hidden">
      {/* Background texture */}
      <div className="grid-pattern absolute inset-0" />

      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg">
                  Quali<span className="text-primary">Events</span>
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Premium event management platform. Create unforgettable experiences with powerful tools for registration, badges, invitations, and more.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-4">Event</h4>
            <ul className="space-y-2.5">
              {[
                { href: "#about", label: "About" },
                { href: "#speakers", label: "Speakers" },
                { href: "#location", label: "Venue" },
                { href: "/register", label: "Register", isLink: true },
              ].map((item) =>
                item.isLink ? (
                  <li key={item.label}>
                    <Link href={item.href} className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 group">
                      {item.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ) : (
                  <li key={item.label}>
                    <a href={item.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {item.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-4">Attendees</h4>
            <ul className="space-y-2.5">
              <li><Link href="/badge" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 group">Get Badge <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 group">Subscribe <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-4">Manage</h4>
            <ul className="space-y-2.5">
              <li><Link href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 group">Dashboard <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
              <li><Link href="/admin/subscribers" className="text-gray-400 hover:text-white text-sm transition-colors">Subscribers</Link></li>
              <li><Link href="/admin/panelists" className="text-gray-400 hover:text-white text-sm transition-colors">Panelists</Link></li>
              <li><Link href="/admin/newsletters" className="text-gray-400 hover:text-white text-sm transition-colors">Newsletters</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-4">Connect</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Support</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              &copy; {currentYear} QualiEvents. Crafted with care.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-gray-500 text-xs">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
