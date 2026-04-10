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
      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      <div className="relative bg-white rounded-[18px] p-6 border border-gray-100 card-hover overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Avatar */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          {photo ? (
            <img
              src={photo}
              alt={`${firstName} ${lastName}`}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-primary/30 transition-all duration-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary via-accent to-secondary-light flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-primary/30 transition-all duration-500 group-hover:scale-105">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
          )}
          {/* Status dot */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <h3 className="text-base font-bold text-secondary group-hover:text-primary transition-colors duration-300">
            {firstName} {lastName}
          </h3>
          {jobTitle && (
            <p className="text-sm text-muted font-medium mt-0.5">{jobTitle}</p>
          )}
          {company && (
            <p className="text-xs text-gray-400 mt-0.5">{company}</p>
          )}
        </div>

        {/* Topic badge */}
        {topic && (
          <div className="mt-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl px-3 py-2.5 text-center border border-primary/10">
            <p className="text-[10px] text-muted uppercase tracking-wider font-medium">Speaking on</p>
            <p className="text-xs font-semibold text-secondary mt-0.5 leading-snug">{topic}</p>
          </div>
        )}

        {/* Bio */}
        <p className="text-gray-500 text-xs mt-4 line-clamp-3 leading-relaxed">{bio}</p>

        {/* Social links */}
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-50">
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-primary/10 flex items-center justify-center text-gray-400 hover:text-primary transition-all duration-200"
            >
              <ExternalLink size={14} />
            </a>
          )}
          {twitter && (
            <a
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-accent/10 flex items-center justify-center text-gray-400 hover:text-accent transition-all duration-200"
            >
              <Globe size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
