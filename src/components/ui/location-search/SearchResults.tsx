import { MapPin } from "lucide-react";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface SearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (item: SearchResult) => void;
  isLoading?: boolean;
}

export function SearchResults({ results, onSelect, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <CommandGroup>
        <CommandItem disabled className="flex items-center gap-2 px-4 py-2">
          Searching...
        </CommandItem>
      </CommandGroup>
    );
  }

  if (!Array.isArray(results) || results.length === 0) {
    return <CommandEmpty>No results found.</CommandEmpty>;
  }

  return (
    <CommandGroup>
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
    </CommandGroup>
  );
}