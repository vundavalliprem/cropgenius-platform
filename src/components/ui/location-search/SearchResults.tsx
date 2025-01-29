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
  onSelect: (result: SearchResult) => void;
  isLoading?: boolean;
}

export function SearchResults({ results, onSelect, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Searching...
      </div>
    );
  }

  if (!Array.isArray(results) || results.length === 0) {
    return <CommandEmpty>No results found.</CommandEmpty>;
  }

  return (
    <>
      {results.map((result, index) => (
        <CommandItem
          key={`${result.lat}-${result.lng}-${index}`}
          onSelect={() => onSelect(result)}
          className="cursor-pointer"
        >
          {result.display_name}
        </CommandItem>
      ))}
    </>
  );
}