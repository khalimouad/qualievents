interface SponsorBadgeProps {
  name: string;
  logo?: string | null;
  website?: string | null;
  tier: string;
}

const tierColors: Record<string, string> = {
  platinum: "from-gray-200 to-gray-400 border-gray-300",
  gold: "from-yellow-100 to-yellow-300 border-yellow-400",
  silver: "from-gray-100 to-gray-300 border-gray-300",
  bronze: "from-orange-100 to-orange-200 border-orange-300",
};

const tierSizes: Record<string, string> = {
  platinum: "p-8 text-xl",
  gold: "p-6 text-lg",
  silver: "p-5 text-base",
  bronze: "p-4 text-sm",
};

export default function SponsorBadge({ name, logo, website, tier }: SponsorBadgeProps) {
  const content = (
    <div
      className={`bg-gradient-to-br ${tierColors[tier] || tierColors.gold} rounded-xl border-2 flex items-center justify-center ${tierSizes[tier] || tierSizes.gold} hover:scale-105 transition-transform cursor-pointer`}
    >
      {logo ? (
        <img src={logo} alt={name} className="max-h-12 object-contain" />
      ) : (
        <span className="font-bold text-gray-700">{name}</span>
      )}
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
