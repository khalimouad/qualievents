import { ExternalLink, Globe } from "lucide-react";

interface SpeakerCardProps {
  firstName: string;
  lastName: string;
  bio: string;
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
  const initials = `${firstName[0]}${lastName[0]}`;

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 via-transparent to-accent/30 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      <div className="relative bg-white/5 backdrop-blur-sm rounded-[18px] p-6 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-300 overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Avatar */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          {photo ? (
            <img
              src={photo}
              alt={`${firstName} ${lastName}`}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/10 group-hover:ring-primary/40 transition-all duration-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary-light flex items-center justify-center ring-2 ring-white/10 group-hover:ring-primary/40 transition-all duration-500 group-hover:scale-105">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
          )}
          {/* Status dot */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-secondary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors duration-300">
            {firstName} {lastName}
          </h3>
          {jobTitle && (
            <p className="text-sm text-gray-400 font-medium mt-0.5">{jobTitle}</p>
          )}
          {company && (
            <p className="text-xs text-gray-500 mt-0.5">{company}</p>
          )}
        </div>

        {/* Topic badge */}
        {topic && (
          <div className="mt-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl px-3 py-2.5 text-center border border-primary/20">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Sujet</p>
            <p className="text-xs font-semibold text-white mt-0.5 leading-snug">{topic}</p>
          </div>
        )}

        {/* Bio */}
        <p className="text-gray-500 text-xs mt-4 line-clamp-3 leading-relaxed">{bio}</p>

        {/* Social links */}
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-white/5">
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 flex items-center justify-center text-gray-500 hover:text-primary transition-all duration-200"
            >
              <ExternalLink size={14} />
            </a>
          )}
          {twitter && (
            <a
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-accent/20 flex items-center justify-center text-gray-500 hover:text-accent transition-all duration-200"
            >
              <Globe size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
