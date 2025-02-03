import React, { useCallback, useState } from 'react';
import { Command, CommandInput, CommandList } from "@/components/ui/command";
import { SearchResults } from './SearchResults';
import { searchLocation } from '@/services/here';
import { useDebounce } from '@/hooks/use-debounce';

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
  const [results, setResults] = useState<Array<{
    lat: number;
    lng: number;
    display_name: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(async (query: string) => {
    if (!query?.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchLocation(query);
      setResults(searchResults || []);
    } catch (error) {
      console.error('Location search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleSearch = useCallback((query: string) => {
    onChange(query);
    debouncedSearch(query);
  }, [onChange, debouncedSearch]);

  return (
    <Command className={className}>
      <CommandInput
        value={value}
        onValueChange={handleSearch}
        placeholder={placeholder}
        className="h-9"
      />
      {(results.length > 0 || isLoading) && (
        <CommandList className="max-h-[200px] overflow-y-auto">
          <SearchResults 
            results={results} 
            isLoading={isLoading} 
            onSelect={(location) => {
              onChange(location.display_name);
              setResults([]);
            }} 
          />
        </CommandList>
      )}
    </Command>
  );
}