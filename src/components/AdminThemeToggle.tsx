"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function AdminThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");
    if (saved === "dark") {
      setDark(true);
      document.getElementById("admin-shell")?.setAttribute("data-admin-dark", "");
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const el = document.getElementById("admin-shell");
    if (next) {
      el?.setAttribute("data-admin-dark", "");
      localStorage.setItem("admin-theme", "dark");
    } else {
      el?.removeAttribute("data-admin-dark");
      localStorage.setItem("admin-theme", "light");
    }
  };

  if (!mounted) return <div className="w-7 h-7" />;

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Mode clair" : "Mode sombre"}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-secondary hover:bg-gray-100 transition-colors"
    >
      {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  );
}
