"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, MapPin } from "lucide-react";
import { LOCATIONS } from "@/lib/locations";

interface Props {
  country: string;
  city: string;
  onChange: (value: { country: string; city: string; lat?: number; lng?: number }) => void;
}

export default function CountryCitySelect({ country, city, onChange }: Props) {
  const [countryQuery, setCountryQuery] = useState(country);
  const [cityQuery, setCityQuery] = useState(city);
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => setCountryQuery(country), [country]);
  useEffect(() => setCityQuery(city), [city]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCountry = LOCATIONS.find((c) => c.name === country);
  const cityOptions = selectedCountry?.cities || [];

  const filteredCountries = LOCATIONS.filter((c) =>
    c.name.toLowerCase().includes(countryQuery.toLowerCase())
  );
  const filteredCities = cityOptions.filter((c) =>
    c.name.toLowerCase().includes(cityQuery.toLowerCase())
  );

  const selectCountry = (name: string) => {
    setCountryQuery(name);
    onChange({ country: name, city: "" });
    setCountryOpen(false);
  };

  const selectCity = (cityName: string) => {
    const c = cityOptions.find((x) => x.name === cityName);
    setCityQuery(cityName);
    onChange({ country, city: cityName, lat: c?.lat, lng: c?.lng });
    setCityOpen(false);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Country */}
      <div ref={countryRef}>
        <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
          Pays <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
          <input
            type="text"
            value={countryQuery}
            onChange={(e) => {
              setCountryQuery(e.target.value);
              onChange({ country: e.target.value, city: "" });
              setCountryOpen(true);
            }}
            onFocus={() => setCountryOpen(true)}
            className="input-base pl-8 pr-8"
            placeholder="France, Côte d'Ivoire..."
            required
            autoComplete="off"
          />
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary transition-transform ${countryOpen ? "rotate-180" : ""}`}
          />
          {countryOpen && filteredCountries.length > 0 && (
            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-border bg-card shadow-lg">
              {filteredCountries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => selectCountry(c.name)}
                  className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-bg-hover transition-colors flex items-center justify-between"
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-text-secondary">{c.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* City */}
      <div ref={cityRef}>
        <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
          Ville <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              onChange({ country, city: e.target.value });
              setCityOpen(true);
            }}
            onFocus={() => setCityOpen(true)}
            className="input-base pl-8 pr-8"
            placeholder={country ? "Paris, Abidjan..." : "Choisissez d'abord un pays"}
            disabled={!country}
            required
            autoComplete="off"
          />
          {cityOptions.length > 0 && (
            <ChevronDown
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary transition-transform ${cityOpen ? "rotate-180" : ""}`}
            />
          )}
          {cityOpen && filteredCities.length > 0 && (
            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-border bg-card shadow-lg">
              {filteredCities.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => selectCity(c.name)}
                  className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-bg-hover transition-colors flex items-center justify-between"
                >
                  <span>{c.name}</span>
                  {c.lat && c.lng && (
                    <span className="text-[9px] text-text-secondary">
                      {c.lat.toFixed(2)}, {c.lng.toFixed(2)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {country && cityOptions.length === 0 && (
            <p className="text-[10px] text-text-secondary mt-1">
              Aucune ville pré-configurée. Entrez le nom manuellement.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
