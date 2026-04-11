"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
    setTheme(current);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
  };

  if (!mounted) {
    return <div className={`w-9 h-9 ${className}`} />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
      className={`w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-secondary hover:bg-black/5 transition-colors ${className}`}
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
