import React, { useState, useCallback } from 'react';
import { Command, CommandInput, CommandEmpty } from "@/components/ui/command";
import { SearchResults } from "./SearchResults";
import { searchLocation } from "@/services/here";
import { useToast } from "@/components/ui/use-toast";
import debounce from 'lodash/debounce';
import { Loader2 } from "lucide-react";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ 
  value, 
  onChange, 
  placeholder = "Search location...", 
  className 
}: LocationSearchProps) {
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
    [toast]
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
    <Command className={`relative rounded-lg border shadow-md ${className}`}>
      <div className="flex items-center border-b px-3">
        <CommandInput
          value={value}
          onValueChange={handleInputChange}
          placeholder={placeholder}
          className="h-9 flex-1"
        />
        {isSearching && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {results.length > 0 ? (
        <SearchResults results={results} onSelect={handleSelect} />
      ) : (
        value && !isSearching && (
          <CommandEmpty className="py-6 text-center text-sm">
            No locations found
          </CommandEmpty>
        )
      )}
    </Command>
  );
}