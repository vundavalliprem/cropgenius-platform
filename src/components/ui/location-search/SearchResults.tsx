import { CommandList, CommandItem, CommandGroup } from "@/components/ui/command";
import { MapPin } from "lucide-react";

interface SearchResult {
  lat: number;
  lng: number;
  display_name: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  if (!results?.length) return null;

  return (
    <CommandList>
      <CommandGroup heading="Locations">
        {results.map((result, index) => (
          <CommandItem
            key={`${result.lat}-${result.lng}-${index}`}
            value={result.display_name}
            onSelect={() => onSelect(result)}
            className="flex items-center gap-2 px-4 py-2 cursor-pointer"
          >
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{result.display_name}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
}