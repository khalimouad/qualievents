"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="text-white font-bold text-xl">QualiEvents</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-gray-300 hover:text-white transition">
              About
            </a>
            <a href="#speakers" className="text-gray-300 hover:text-white transition">
              Speakers
            </a>
            <a href="#location" className="text-gray-300 hover:text-white transition">
              Location
            </a>
            <a href="#sponsors" className="text-gray-300 hover:text-white transition">
              Sponsors
            </a>
            <Link
              href="/register"
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Register Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="#about" className="block text-gray-300 hover:text-white py-2 transition" onClick={() => setIsOpen(false)}>
              About
            </a>
            <a href="#speakers" className="block text-gray-300 hover:text-white py-2 transition" onClick={() => setIsOpen(false)}>
              Speakers
            </a>
            <a href="#location" className="block text-gray-300 hover:text-white py-2 transition" onClick={() => setIsOpen(false)}>
              Location
            </a>
            <a href="#sponsors" className="block text-gray-300 hover:text-white py-2 transition" onClick={() => setIsOpen(false)}>
              Sponsors
            </a>
            <Link
              href="/register"
              className="block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium text-center transition"
              onClick={() => setIsOpen(false)}
            >
              Register Now
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
