"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";
import type { Country } from "react-phone-number-input";

// Get flag emoji from country code
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface CountrySelectProps {
  value?: Country;
  onChange: (value: Country) => void;
  labels: Record<string, string>;
  disabled?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  labels = en,
  disabled,
}: CountrySelectProps) {
  const countries = useMemo(() => getCountries(), []);

  return (
    <Select
      value={value || ""}
      onValueChange={(val) => onChange(val as Country)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[80px] h-8 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 px-2">
        <SelectValue>
          {value ? (
            <span className="flex items-center gap-1">
              <span className="text-base">{getFlagEmoji(value)}</span>
              <span className="text-xs text-muted-foreground">
                +{getCountryCallingCode(value)}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">🌐</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {countries.map((country) => (
          <SelectItem key={country} value={country}>
            <span className="flex items-center gap-2">
              <span className="text-base">{getFlagEmoji(country)}</span>
              <span className="flex-1">{labels[country] || country}</span>
              <span className="text-xs text-muted-foreground">
                +{getCountryCallingCode(country)}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
