"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, UserCheck, Award, Send, Mail } from "lucide-react";

export default function EventTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/admin/events/${slug}`;

  const tabs = [
    { href: base, label: "Overview", icon: LayoutGrid },
    { href: `${base}/subscribers`, label: "Subscribers", icon: Users },
    { href: `${base}/panelists`, label: "Panelists", icon: UserCheck },
    { href: `${base}/sponsors`, label: "Sponsors", icon: Award },
    { href: `${base}/invitations`, label: "Invitations", icon: Send },
    { href: `${base}/newsletters`, label: "Newsletters", icon: Mail },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-gray-100">
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
                : "text-muted border-transparent hover:text-secondary"
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
