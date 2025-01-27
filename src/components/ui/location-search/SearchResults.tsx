import React from 'react';
import { Command } from 'cmdk';
import { MapPin } from 'lucide-react';

interface SearchResultsProps {
  results: Array<{ display_name: string }>;
  onSelect: (item: { display_name: string }) => void;
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  if (!results.length) return null;

  return (
    <>
      {results.map((item, index) => (
        <Command.Item
          key={`${item.display_name}-${index}`}
          value={item.display_name}
          onSelect={() => onSelect(item)}
          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
        >
          <MapPin className="h-4 w-4" />
          <span>{item.display_name}</span>
        </Command.Item>
      ))}
    </>
  );
}