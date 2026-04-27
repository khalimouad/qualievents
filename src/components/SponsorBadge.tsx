interface SponsorBadgeProps {
  name: string;
  logo?: string | null;
  website?: string | null;
  tier: string;
}

const tierConfig: Record<string, { bg: string; border: string; text: string; size: string; glow: string }> = {
  platinum: {
    bg: "bg-white/10 backdrop-blur-sm",
    border: "border-white/20 hover:border-white/30",
    text: "text-foreground text-lg font-bold",
    size: "p-8",
    glow: "from-white/20 to-transparent",
  },
  gold: {
    bg: "bg-amber-500/10 backdrop-blur-sm",
    border: "border-amber-500/30 hover:border-amber-500/50",
    text: "text-amber-200 text-base font-bold",
    size: "p-6",
    glow: "from-amber-500/30 to-transparent",
  },
  silver: {
    bg: "bg-black/5 dark:bg-white/5 backdrop-blur-sm",
    border: "border-white/15 hover:border-white/25",
    text: "text-foreground text-sm font-semibold",
    size: "p-5",
    glow: "from-white/15 to-transparent",
  },
  bronze: {
    bg: "bg-orange-500/10 backdrop-blur-sm",
    border: "border-orange-500/30 hover:border-orange-500/50",
    text: "text-foreground text-xs font-semibold",
    size: "p-4",
    glow: "from-orange-500/30 to-transparent",
  },
};

export default function SponsorBadge({ name, logo, website, tier }: SponsorBadgeProps) {
  const config = tierConfig[tier] || tierConfig.gold;

  const content = (
    <div className="group relative">
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${config.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`} />
      <div
        className={`relative ${config.bg} rounded-xl border ${config.border} flex items-center justify-center ${config.size} transition-all duration-300 group-hover:scale-[1.03]`}
      >
        {logo ? (
          <img src={logo} alt={name} className="max-h-10 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <span className={config.text}>{name}</span>
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
