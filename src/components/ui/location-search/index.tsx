import React, { useState, useCallback } from 'react';
import { Command, CommandInput } from "@/components/ui/command";
import { SearchResults } from "./SearchResults";
import { searchLocation } from "@/services/here";
import { useToast } from "@/components/ui/use-toast";
import debounce from 'lodash/debounce';

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ value, onChange, placeholder = "Search location...", className }: LocationSearchProps) {
  const [results, setResults] = useState<Array<{ lat: number; lng: number; display_name: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await searchLocation(searchTerm);
        setResults(searchResults || []);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "Failed to search location. Please try again.",
          variant: "destructive",
        });
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    handleSearch(newValue);
  };

  const handleSelect = (result: { lat: number; lng: number; display_name: string }) => {
    onChange(result.display_name);
    setResults([]);
  };

  return (
    <div className={`relative ${className}`}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          value={value}
          onValueChange={handleInputChange}
          placeholder={placeholder}
          className="h-9"
        />
      </Command>
      {results.length > 0 && (
        <SearchResults results={results} onSelect={handleSelect} />
      )}
    </div>
  );
}