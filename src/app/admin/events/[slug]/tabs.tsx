"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, UserCheck, Award, Send, Mail, CreditCard } from "lucide-react";
import { t } from "@/lib/i18n";

export default function EventTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/admin/events/${slug}`;

  const tabs = [
    { href: base, label: t.admin.overview, icon: LayoutGrid },
    { href: `${base}/subscribers`, label: t.admin.subscribers, icon: Users },
    { href: `${base}/panelists`, label: t.admin.panelists, icon: UserCheck },
    { href: `${base}/sponsors`, label: t.admin.sponsors, icon: Award },
    { href: `${base}/invitations`, label: t.admin.invitations, icon: Send },
    { href: `${base}/newsletters`, label: t.admin.newsletters, icon: Mail },
    { href: `${base}/payments`, label: "Paiements", icon: CreditCard },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              isActive
                ? "text-primary border-primary"
                : "text-text-secondary border-transparent hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
