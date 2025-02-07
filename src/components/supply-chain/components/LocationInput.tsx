
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface LocationSuggestion {
  place_name: string;
  center: [number, number];
}

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (suggestion: LocationSuggestion) => void;
  suggestions: LocationSuggestion[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
}

export function LocationInput({
  label,
  value,
  onChange,
  onLocationSelect,
  suggestions,
  showSuggestions,
  setShowSuggestions,
}: LocationInputProps) {
  return (
    <div className="relative">
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <Input 
        placeholder={`Enter ${label.toLowerCase()}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full px-4 py-2 text-left hover:bg-accent first:rounded-t-md last:rounded-b-md"
              onClick={() => {
                onLocationSelect(suggestion);
                setShowSuggestions(false);
              }}
            >
              <MapPin className="inline-block mr-2 h-4 w-4" />
              {suggestion.place_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
