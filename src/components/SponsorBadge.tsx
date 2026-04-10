interface SponsorBadgeProps {
  name: string;
  logo?: string | null;
  website?: string | null;
  tier: string;
}

const tierConfig: Record<string, { bg: string; border: string; text: string; size: string; glow: string }> = {
  platinum: {
    bg: "bg-gradient-to-br from-slate-50 to-slate-100",
    border: "border-slate-200 hover:border-slate-300",
    text: "text-slate-700 text-lg font-bold",
    size: "p-8",
    glow: "from-slate-200/50 to-transparent",
  },
  gold: {
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
    border: "border-amber-200/60 hover:border-amber-300",
    text: "text-amber-800 text-base font-bold",
    size: "p-6",
    glow: "from-amber-200/40 to-transparent",
  },
  silver: {
    bg: "bg-gradient-to-br from-gray-50 to-slate-50",
    border: "border-gray-200 hover:border-gray-300",
    text: "text-gray-600 text-sm font-semibold",
    size: "p-5",
    glow: "from-gray-200/30 to-transparent",
  },
  bronze: {
    bg: "bg-gradient-to-br from-orange-50 to-amber-50",
    border: "border-orange-200/50 hover:border-orange-300",
    text: "text-orange-700 text-xs font-semibold",
    size: "p-4",
    glow: "from-orange-200/30 to-transparent",
  },
};

export default function SponsorBadge({ name, logo, website, tier }: SponsorBadgeProps) {
  const config = tierConfig[tier] || tierConfig.gold;

  const content = (
    <div className="group relative">
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${config.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`} />
      <div
        className={`relative ${config.bg} rounded-xl border ${config.border} flex items-center justify-center ${config.size} transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-md`}
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
