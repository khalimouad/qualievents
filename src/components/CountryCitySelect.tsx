"use client";

import { useState } from "react";
import { LOCATIONS } from "@/lib/locations";

interface Props {
  country: string;
  city: string;
  onChange: (value: { country: string; city: string; lat?: number; lng?: number }) => void;
}

export default function CountryCitySelect({ country, city, onChange }: Props) {
  const [showCountryList, setShowCountryList] = useState(false);
  const [showCityList, setShowCityList] = useState(false);

  const selectedCountry = LOCATIONS.find((c) => c.name === country);
  const cityOptions = selectedCountry?.cities || [];

  const handleCountrySelect = (countryName: string) => {
    onChange({ country: countryName, city: "" });
    setShowCountryList(false);
  };

  const handleCitySelect = (cityName: string) => {
    const city = cityOptions.find((c) => c.name === cityName);
    onChange({
      country,
      city: cityName,
      lat: city?.lat,
      lng: city?.lng,
    });
    setShowCityList(false);
  };

  const handleCountryInput = (value: string) => {
    onChange({ country: value, city: "" });
  };

  const handleCityInput = (value: string) => {
    onChange({ country, city: value });
  };

  const countryList = LOCATIONS.map((c) => c.name);
  const filteredCountries = countryList.filter((c) =>
    c.toLowerCase().includes(country.toLowerCase())
  );
  const filteredCities = cityOptions
    .map((c) => c.name)
    .filter((c) => c.toLowerCase().includes(city.toLowerCase()));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
          Pays <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            list="countries-list"
            value={country}
            onChange={(e) => handleCountryInput(e.target.value)}
            onFocus={() => setShowCountryList(true)}
            onBlur={() => setTimeout(() => setShowCountryList(false), 100)}
            className="input-base"
            placeholder="France, Côte d'Ivoire..."
            required
          />
          <datalist id="countries-list">
            {filteredCountries.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
          Ville <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            list="cities-list"
            value={city}
            onChange={(e) => handleCityInput(e.target.value)}
            onFocus={() => setShowCityList(true)}
            onBlur={() => setTimeout(() => setShowCityList(false), 100)}
            className="input-base"
            placeholder="Paris, Abidjan..."
            disabled={!country}
            required
          />
          <datalist id="cities-list">
            {filteredCities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {country && cityOptions.length === 0 && (
            <p className="text-[10px] text-muted mt-1">
              Aucune ville pré-configurée. Entrez le nom manuellement.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
