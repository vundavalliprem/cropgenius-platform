import React from 'react';
import { CommandItem } from "@/components/ui/command";
import { MapPin } from 'lucide-react';

interface SearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (item: SearchResult) => void;
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  if (!Array.isArray(results) || results.length === 0) return null;

  return (
    <>
      {results.map((item, index) => (
        <CommandItem
          key={`${item.display_name}-${index}`}
          value={item.display_name}
          onSelect={() => onSelect(item)}
          className="flex items-center gap-2 px-4 py-2"
        >
          <MapPin className="h-4 w-4" />
          <span>{item.display_name}</span>
        </CommandItem>
      ))}
    </>
  );
}