import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-secondary overflow-hidden">
      <div className="grid-pattern absolute inset-0" />
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
              Plateforme premium de gestion d&apos;événements. Créez des expériences inoubliables avec des outils puissants pour l&apos;inscription, les badges, les invitations, et plus encore.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-4">Événement</h4>
            <ul className="space-y-2.5">
              <li><a href="#about" className="text-gray-400 hover:text-white text-sm transition-colors">À propos</a></li>
              <li><a href="#speakers" className="text-gray-400 hover:text-white text-sm transition-colors">Intervenants</a></li>
              <li><a href="#location" className="text-gray-400 hover:text-white text-sm transition-colors">Lieu</a></li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 group">
                  S&apos;inscrire
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-4">Participants</h4>
            <ul className="space-y-2.5">
              <li><Link href="/badge" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 group">Mon badge <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 group">S&apos;inscrire <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-4">Gestion</h4>
            <ul className="space-y-2.5">
              <li><Link href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1 group">Tableau de bord <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
              <li><Link href="/scan" className="text-gray-400 hover:text-white text-sm transition-colors">Scanner</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-4">Contact</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Support</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Confidentialité</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              &copy; {currentYear} QualiEvents. Conçu avec soin.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-gray-500 text-xs">Tous les systèmes sont opérationnels</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
