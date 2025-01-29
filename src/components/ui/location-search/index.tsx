import React, { useCallback, useState } from "react";
import { Command, CommandInput } from "@/components/ui/command";
import { SearchResults } from "./SearchResults";
import { searchLocation } from "@/services/here";
import { useToast } from "@/components/ui/use-toast";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ value, onChange, placeholder, className }: LocationSearchProps) {
  const [results, setResults] = useState<Array<{ lat: number; lng: number; display_name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchLocation(searchTerm);
      // Ensure we only pass cloneable data
      const cleanResults = searchResults.map(result => ({
        lat: result.lat,
        lng: result.lng,
        display_name: result.display_name
      }));
      setResults(cleanResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      toast({
        title: "Search Error",
        description: "Failed to search location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return (
    <Command className={className}>
      <CommandInput
        value={value}
        onValueChange={(value) => {
          onChange(value);
          handleSearch(value);
        }}
        placeholder={placeholder}
      />
      <SearchResults 
        results={results} 
        isLoading={isLoading}
        onSelect={(result) => {
          onChange(result.display_name);
          setResults([]);
        }}
      />
    </Command>
  );
}