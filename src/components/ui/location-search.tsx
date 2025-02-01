import React, { useCallback, useState } from "react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchLocation } from "@/services/here";
import { SearchResults } from "./location-search/SearchResults";
import { useToast } from "@/components/ui/use-toast";

interface SearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

type LocationSearchProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

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
  const { toast } = useToast();

  const handleSearch = useCallback(async (searchValue: string) => {
    if (!searchValue?.trim()) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchLocation(searchValue);
      
      // Ensure results is always an array and contains only cloneable data
      const sanitizedResults = Array.isArray(results) ? results.map(result => ({
        lat: Number(result.lat) || 0,
        lng: Number(result.lng) || 0,
        display_name: String(result.display_name || '')
      })) : [];
      
      setSearchResults(sanitizedResults);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search location. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const handleSelect = useCallback((result: SearchResult) => {
    if (!result?.display_name) return;
    onChange(result.display_name);
    setSearchResults([]);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className={cn("relative", className)} {...props}>
      <Command shouldFilter={false} className="border rounded-md">
        <div className="flex items-center border-b px-3">
          <CommandInput
            value={value}
            onValueChange={(newValue) => {
              onChange(newValue);
              handleSearch(newValue);
            }}
            placeholder={placeholder}
            className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {isOpen && searchResults.length > 0 && (
          <CommandList>
            <SearchResults 
              results={searchResults}
              onSelect={handleSelect}
              isLoading={isSearching}
            />
          </CommandList>
        )}
      </Command>
    </div>
  );
}