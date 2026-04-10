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
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100 group">
      <div className="text-center mb-4">
        {photo ? (
          <img
            src={photo}
            alt={`${firstName} ${lastName}`}
            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary/20 group-hover:border-primary/40 transition"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-secondary to-accent flex items-center justify-center border-4 border-primary/20 group-hover:border-primary/40 transition">
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-secondary text-center">
        {firstName} {lastName}
      </h3>

      {jobTitle && (
        <p className="text-primary text-sm font-medium text-center">{jobTitle}</p>
      )}
      {company && (
        <p className="text-gray-500 text-sm text-center">{company}</p>
      )}

      {topic && (
        <div className="mt-3 bg-primary/5 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Topic</p>
          <p className="text-sm font-medium text-secondary">{topic}</p>
        </div>
      )}

      <p className="text-gray-600 text-sm mt-3 line-clamp-3">{bio}</p>

      <div className="flex justify-center gap-3 mt-4">
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-600 transition"
          >
            <ExternalLink size={18} />
          </a>
        )}
        {twitter && (
          <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-sky-500 transition"
          >
            <Globe size={18} />
          </a>
        )}
      </div>
    </div>
  );
}
