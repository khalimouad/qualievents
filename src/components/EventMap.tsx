"use client";

import { MapPin, Navigation } from "lucide-react";

interface EventMapProps {
  latitude: number;
  longitude: number;
  venue: string;
  address: string;
  city: string;
  country: string;
}

export default function EventMap({
  latitude,
  longitude,
  venue,
  address,
  city,
  country,
}: EventMapProps) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.005}%2C${longitude + 0.01}%2C${latitude + 0.005}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="relative group">
      {/* Decorative glow */}
      <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-[24px] overflow-hidden shadow-2xl border border-black/5 dark:border-white/10">
        {/* Map */}
        <div className="relative h-[350px] sm:h-[400px] overflow-hidden">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0, filter: "saturate(0.7) brightness(0.85)" }}
            loading="lazy"
            title="Event Location"
            className="w-full h-full"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-secondary/80 to-transparent pointer-events-none" />
        </div>

        {/* Info bar */}
        <div className="p-6 sm:p-8 bg-secondary/50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30">
              <MapPin className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground">{venue}</h3>
              <p className="text-muted text-sm mt-0.5">{address}</p>
              <p className="text-muted text-sm">{city}, {country}</p>
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-foreground text-sm font-medium rounded-xl transition-colors duration-200"
            >
              <Navigation className="w-4 h-4" />
              <span className="hidden sm:inline">Itinéraire</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
