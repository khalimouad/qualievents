"use client";

import { MapPin } from "lucide-react";

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

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
      <div className="relative">
        <iframe
          src={mapUrl}
          width="100%"
          height="400"
          style={{ border: 0 }}
          loading="lazy"
          title="Event Location"
          className="w-full"
        />
      </div>
      <div className="bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-secondary">{venue}</h3>
            <p className="text-gray-600">{address}</p>
            <p className="text-gray-500">
              {city}, {country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
