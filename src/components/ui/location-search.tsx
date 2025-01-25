import React, { useCallback, useState } from "react";
import { Command, CommandInput } from "@/components/ui/command";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchLocation } from "@/services/here";
import { SearchResults } from "./location-search/SearchResults";

type LocationSearchProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

interface SearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

export function LocationSearch({
  value,
  onChange,
  placeholder = "Search location...",
  className,
  ...props
}: LocationSearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = useCallback(async (searchValue: string) => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchLocation(searchValue);
      setSearchResults(results || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelect = useCallback((result: SearchResult) => {
    onChange(result.display_name);
    setSearchResults([]);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className={cn("relative", className)} {...props}>
      <Command className="relative" shouldFilter={false}>
        <CommandInput
          value={value}
          onValueChange={(value) => {
            onChange(value);
            handleSearch(value);
          }}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </Command>

      {isSearching && (
        <div className="absolute right-2 top-2.5 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {isOpen && searchResults.length > 0 && (
        <SearchResults 
          results={searchResults}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}