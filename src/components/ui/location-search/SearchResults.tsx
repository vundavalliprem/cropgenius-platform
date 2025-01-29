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
  isLoading: boolean;
  onSelect: (result: SearchResult) => void;
}

export function SearchResults({ results, isLoading, onSelect }: SearchResultsProps) {
  if (isLoading) {
    return (
      <CommandGroup>
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </CommandGroup>
    );
  }

  // Ensure results is always an array
  const safeResults = Array.isArray(results) ? results : [];

  if (!safeResults.length) {
    return <CommandEmpty>No results found.</CommandEmpty>;
  }

  return (
    <CommandGroup>
      {safeResults.map((result, index) => (
        <CommandItem
          key={`${result.lat}-${result.lng}-${index}`}
          value={result.display_name}
          onSelect={() => onSelect(result)}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {result.display_name}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}