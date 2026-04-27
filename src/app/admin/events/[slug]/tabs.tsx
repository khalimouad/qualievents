"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, UserCheck, Award, Send, Mail, CreditCard, Image as ImageIcon } from "lucide-react";
import { t } from "@/lib/i18n";

export default function EventTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/admin/events/${slug}`;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFadeLeft, setShowFadeLeft] = useState(false);
  const [showFadeRight, setShowFadeRight] = useState(false);

  const tabs = [
    { href: base, label: t.admin.overview, icon: LayoutGrid },
    { href: `${base}/subscribers`, label: t.admin.subscribers, icon: Users },
    { href: `${base}/panelists`, label: t.admin.panelists, icon: UserCheck },
    { href: `${base}/sponsors`, label: t.admin.sponsors, icon: Award },
    { href: `${base}/gallery`, label: "Galerie", icon: ImageIcon },
    { href: `${base}/invitations`, label: t.admin.invitations, icon: Send },
    { href: `${base}/newsletters`, label: t.admin.newsletters, icon: Mail },
    { href: `${base}/payments`, label: "Paiements", icon: CreditCard },
  ];

  // Auto-scroll the active tab into view + show edge fades when overflow
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>("[data-active='true']");
    if (active) {
      const elRect = el.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      if (activeRect.left < elRect.left || activeRect.right > elRect.right) {
        active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
    const update = () => {
      setShowFadeLeft(el.scrollLeft > 4);
      setShowFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <div className="relative -mx-4 sm:mx-0">
      <div
        ref={scrollRef}
        className="flex gap-0.5 overflow-x-auto no-scrollbar border-b border-border px-4 sm:px-0 scroll-smooth"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              data-active={isActive}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-3 text-[13px] font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                isActive
                  ? "text-primary"
                  : "text-text-secondary hover:text-foreground hover:bg-hover/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
              <span>{tab.label}</span>
              <span
                className={`absolute left-2 right-2 -bottom-px h-0.5 rounded-full transition-all duration-300 ${
                  isActive ? "bg-primary opacity-100 scale-x-100" : "bg-primary opacity-0 scale-x-0"
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Edge fades when the strip is overflowing — feedback that there's more */}
      <div
        className={`pointer-events-none absolute left-0 top-0 bottom-px w-8 bg-gradient-to-r from-background to-transparent transition-opacity ${showFadeLeft ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`pointer-events-none absolute right-0 top-0 bottom-px w-8 bg-gradient-to-l from-background to-transparent transition-opacity ${showFadeRight ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
