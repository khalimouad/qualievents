import { ExternalLink, Globe } from "lucide-react";

const SPEAKER_PHOTOS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=160&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&q=80&auto=format&fit=crop&crop=face",
];

function speakerPhoto(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) { h = (h << 5) - h + name.charCodeAt(i); h |= 0; }
  return SPEAKER_PHOTOS[Math.abs(h) % SPEAKER_PHOTOS.length];
}

interface SpeakerCardProps {
  firstName: string;
  lastName: string;
  bio?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  topic?: string | null;
  photo?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
}

export default function SpeakerCard({
  firstName,
  lastName,
  bio,
  company,
  jobTitle,
  topic,
  photo,
  linkedin,
  twitter,
}: SpeakerCardProps) {
  const photoSrc = photo || speakerPhoto(`${firstName} ${lastName}`);

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 via-transparent to-accent/30 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      <div className="relative bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-[18px] p-6 border border-black/5 dark:border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-300 overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Avatar */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          <img
            src={photoSrc}
            alt={`${firstName} ${lastName}`}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/10 group-hover:ring-primary/40 transition-all duration-500 group-hover:scale-105"
          />
          {/* Status dot */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-secondary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">
            {firstName} {lastName}
          </h3>
          {jobTitle && (
            <p className="text-sm text-text-secondary font-medium mt-0.5">{jobTitle}</p>
          )}
          {company && (
            <p className="text-xs text-text-secondary mt-0.5">{company}</p>
          )}
        </div>

        {/* Topic badge */}
        {topic && (
          <div className="mt-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl px-3 py-2.5 text-center border border-primary/20">
            <p className="text-[10px] text-primary uppercase tracking-wider font-medium">Sujet</p>
            <p className="text-xs font-semibold text-foreground mt-0.5 leading-snug">{topic}</p>
          </div>
        )}

        {/* Bio */}
        {bio && <p className="text-text-secondary text-xs mt-4 line-clamp-3 leading-relaxed">{bio}</p>}

        {/* Social links */}
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-white/5">
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-primary/20 flex items-center justify-center text-text-secondary hover:text-primary transition-all duration-200"
            >
              <ExternalLink size={14} />
            </a>
          )}
          {twitter && (
            <a
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-accent/20 flex items-center justify-center text-text-secondary hover:text-accent transition-all duration-200"
            >
              <Globe size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
