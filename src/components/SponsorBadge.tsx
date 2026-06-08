"use client";

import { useState } from "react";

interface SponsorBadgeProps {
  name: string;
  logo?: string | null;
  website?: string | null;
  tier: string;
}

const tierConfig: Record<string, { bg: string; border: string; text: string; size: string; glow: string; logoH: string }> = {
  institutionnel: {
    bg: "bg-blue-500/10 backdrop-blur-sm",
    border: "border-blue-500/30 hover:border-blue-500/50",
    text: "text-blue-200 text-base font-bold",
    size: "p-6 sm:p-7",
    glow: "from-blue-500/30 to-transparent",
    logoH: "max-h-14 sm:max-h-16",
  },
  platinum: {
    bg: "bg-white/10 backdrop-blur-sm",
    border: "border-white/20 hover:border-white/30",
    text: "text-foreground text-lg font-bold",
    size: "p-6 sm:p-7",
    glow: "from-white/20 to-transparent",
    logoH: "max-h-14 sm:max-h-16",
  },
  gold: {
    bg: "bg-amber-500/10 backdrop-blur-sm",
    border: "border-amber-500/30 hover:border-amber-500/50",
    text: "text-amber-200 text-base font-bold",
    size: "p-5 sm:p-6",
    glow: "from-amber-500/30 to-transparent",
    logoH: "max-h-12",
  },
  silver: {
    bg: "bg-black/5 dark:bg-white/5 backdrop-blur-sm",
    border: "border-white/15 hover:border-white/25",
    text: "text-foreground text-sm font-semibold",
    size: "p-4 sm:p-5",
    glow: "from-white/15 to-transparent",
    logoH: "max-h-10",
  },
  bronze: {
    bg: "bg-orange-500/10 backdrop-blur-sm",
    border: "border-orange-500/30 hover:border-orange-500/50",
    text: "text-foreground text-xs font-semibold",
    size: "p-3.5 sm:p-4",
    glow: "from-orange-500/30 to-transparent",
    logoH: "max-h-8",
  },
  partenaire: {
    bg: "bg-teal-500/10 backdrop-blur-sm",
    border: "border-teal-500/25 hover:border-teal-500/45",
    text: "text-teal-200 text-sm font-semibold",
    size: "p-4 sm:p-5",
    glow: "from-teal-500/20 to-transparent",
    logoH: "max-h-10",
  },
  media: {
    bg: "bg-purple-500/10 backdrop-blur-sm",
    border: "border-purple-500/25 hover:border-purple-500/45",
    text: "text-purple-200 text-sm font-semibold",
    size: "p-4 sm:p-5",
    glow: "from-purple-500/20 to-transparent",
    logoH: "max-h-10",
  },
};

export default function SponsorBadge({ name, logo, website, tier }: SponsorBadgeProps) {
  const config = tierConfig[tier.toLowerCase()] || tierConfig.gold;
  const [imgFailed, setImgFailed] = useState(false);

  const content = (
    <div className="group relative">
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${config.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`} />
      <div
        className={`relative ${config.bg} rounded-xl border ${config.border} flex items-center justify-center ${config.size} transition-all duration-300 group-hover:scale-[1.03] min-h-[5rem]`}
      >
        {logo && !imgFailed ? (
          <img
            src={logo}
            alt={name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className={`${config.logoH} max-w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity`}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className={`${config.text} text-center`}>{name}</span>
        )}
      </div>
    </div>
  );

  if (website) {
    return (
      <a href={website} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
