import React, { useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { SearchResults } from './SearchResults';
import { useDebounce } from '@/hooks/use-debounce';
import { searchLocation } from '@/services/here';
import { Loader2 } from 'lucide-react';

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ value, onChange, placeholder = 'Search locations...', className }: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; display_name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchLocation(term);
      // Ensure results is always an array
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search location');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  }, [debouncedSearch]);

  const handleSelect = useCallback((item: { display_name: string }) => {
    onChange(item.display_name);
    setSearchTerm('');
    setSearchResults([]);
  }, [onChange]);

  return (
    <div className={className}>
      <Command className="border rounded-lg shadow-sm">
        <div className="flex items-center border-b px-3">
          <Command.Input
            value={searchTerm}
            onValueChange={handleSearch}
            placeholder={placeholder}
            className="flex h-10 w-full rounded-md bg-transparent py-3 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {(searchResults.length > 0 || error) && (
          <Command.List className="max-h-[200px] overflow-y-auto p-2">
            {error ? (
              <Command.Item disabled className="text-sm text-destructive px-2 py-1.5">
                {error}
              </Command.Item>
            ) : (
              <SearchResults results={searchResults} onSelect={handleSelect} />
            )}
          </Command.List>
        )}
      </Command>
    </div>
  );
}