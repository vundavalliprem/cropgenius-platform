import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { MapPin, Loader2 } from "lucide-react";

interface SearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
  isLoading?: boolean;
}

export function SearchResults({ results, onSelect, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <CommandGroup>
        <CommandItem disabled className="flex items-center gap-2 px-4 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Searching...</span>
        </CommandItem>
      </CommandGroup>
    );
  }

  if (!Array.isArray(results) || results.length === 0) {
    return <CommandEmpty>No results found.</CommandEmpty>;
  }

  return (
    <CommandGroup>
      {results.map((result, index) => (
        <CommandItem
          key={`${result.lat}-${result.lng}-${index}`}
          onSelect={() => onSelect(result)}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer"
        >
          <MapPin className="h-4 w-4" />
          <span>{result.display_name}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}