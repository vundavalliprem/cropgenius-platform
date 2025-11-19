import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

interface SearchBarProps {
  onLocationSelect: (lat: number, lng: number, cityName: string) => void;
  className?: string;
}

interface SearchSuggestion {
  place_name: string;
  center: [number, number];
}

export function SearchBar({ onLocationSelect, className = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchSuggestions, setSearchSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleSearchInput = React.useCallback(async (value: string) => {
    setSearchQuery(value);
    if (value.trim().length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?access_token=${mapboxgl.accessToken}&types=place`
      );
      
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      setSearchSuggestions(data.features);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search suggestion error:', error);
      setSearchSuggestions([]);
    }
  }, []);

  const handleSuggestionClick = React.useCallback((suggestion: SearchSuggestion) => {
    const [lng, lat] = suggestion.center;
    onLocationSelect(lat, lng, suggestion.place_name);
    setSearchQuery(suggestion.place_name);
    setShowSuggestions(false);
  }, [onLocationSelect]);

  const handleSearch = React.useCallback(async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      
      if (!response.ok) throw new Error('Failed to search location');
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const cityName = data.features[0].place_name;
        onLocationSelect(lat, lng, cityName);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [searchQuery, onLocationSelect]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 glass-card border-[hsl(var(--neon-blue))]/30 rounded-full h-12 shadow-lg backdrop-blur-xl"
          />
        </div>
        <Button 
          onClick={handleSearch}
          className="glass-panel bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))] hover:opacity-90 transition-all hover:scale-105 border-0 rounded-full h-12 px-6"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      {showSuggestions && searchSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl p-2 z-50 max-h-60 overflow-y-auto">
          {searchSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-[hsl(var(--neon-blue))]/10 transition-colors"
            >
              {suggestion.place_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
