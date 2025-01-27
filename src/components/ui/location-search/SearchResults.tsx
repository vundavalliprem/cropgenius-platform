import { Command, CommandList, CommandItem } from "@/components/ui/command";

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
    <Command className="absolute z-50 w-full mt-1">
      <CommandList className="rounded-lg border bg-popover shadow-md">
        {results.map((result, index) => (
          <CommandItem
            key={`${result.lat}-${result.lng}-${index}`}
            value={result.display_name}
            onSelect={() => onSelect(result)}
            className="cursor-pointer"
          >
            {result.display_name}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
}