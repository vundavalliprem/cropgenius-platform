import { CommandList, CommandItem } from "@/components/ui/command";

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
    <CommandList className="absolute z-50 mt-2 w-full rounded-md border bg-popover p-2 shadow-md">
      {results.map((result, index) => (
        <CommandItem
          key={`${result.lat}-${result.lng}-${index}`}
          value={result.display_name}
          onSelect={() => onSelect(result)}
          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
        >
          {result.display_name}
        </CommandItem>
      ))}
    </CommandList>
  );
}