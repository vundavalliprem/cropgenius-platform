import { useState } from "react";
import { Command, CommandInput } from "@/components/ui/command";
import { SearchResults } from "./SearchResults";
import { useDebounce } from "@/hooks/use-debounce";
import { searchLocation } from "@/services/here";

export interface SearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Search location...",
  className,
}: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchLocation(searchTerm);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const handleSearch = (searchTerm: string) => {
    onChange(searchTerm);
    debouncedSearch(searchTerm);
  };

  const handleSelect = (result: SearchResult) => {
    onChange(result.display_name);
    onSelect?.(result);
    setIsOpen(false);
  };

  return (
    <Command className={className}>
      <CommandInput
        value={value}
        onValueChange={handleSearch}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="relative mt-2">
          <div className="absolute top-0 z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <SearchResults
              results={searchResults}
              onSelect={handleSelect}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </Command>
  );
}