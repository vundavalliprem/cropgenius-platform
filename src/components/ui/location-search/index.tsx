import { useState } from "react";
import { Command, CommandInput, CommandList } from "@/components/ui/command";
import { SearchResults } from "./SearchResults";
import { useToast } from "@/components/ui/use-toast";
import { searchLocation } from "@/services/here";

interface SearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ value, onChange, placeholder, className }: LocationSearchProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm?.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchLocation(searchTerm);
      
      // Ensure we only keep cloneable data and handle potential undefined values
      const cleanResults = Array.isArray(searchResults) ? searchResults.map(result => ({
        lat: Number(result.lat) || 0,
        lng: Number(result.lng) || 0,
        display_name: String(result.display_name || '')
      })) : [];
      
      setResults(cleanResults);
    } catch (error) {
      console.error('Error in searchLocation:', error);
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "Failed to search location",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

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
      <CommandList>
        <SearchResults 
          results={results} 
          isLoading={isLoading}
          onSelect={(result) => {
            onChange(result.display_name);
            setResults([]);
          }}
        />
      </CommandList>
    </Command>
  );
}
