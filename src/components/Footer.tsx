import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-secondary text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="text-white font-bold text-xl">QualiEvents</span>
            </div>
            <p className="text-sm">
              Premium event management platform. Create, manage, and deliver
              exceptional events.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-white transition">About</a></li>
              <li><a href="#speakers" className="hover:text-white transition">Speakers</a></li>
              <li><a href="#location" className="hover:text-white transition">Venue</a></li>
              <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Attendees</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/badge" className="hover:text-white transition">Get Your Badge</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Subscribe</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Admin</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/admin" className="hover:text-white transition">Dashboard</Link></li>
              <li><Link href="/admin/subscribers" className="hover:text-white transition">Subscribers</Link></li>
              <li><Link href="/admin/panelists" className="hover:text-white transition">Panelists</Link></li>
              <li><Link href="/admin/newsletters" className="hover:text-white transition">Newsletters</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} QualiEvents. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
