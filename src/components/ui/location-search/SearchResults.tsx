import { Command } from "cmdk";

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
  if (!results.length) return null;

  return (
    <Command.List className="absolute mt-2 w-full rounded-md border bg-popover p-2 shadow-md">
      {results.map((result, index) => (
        <Command.Item
          key={`${result.lat}-${result.lng}-${index}`}
          value={result.display_name}
          onSelect={() => onSelect(result)}
          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        >
          {result.display_name}
        </Command.Item>
      ))}
    </Command.List>
  );
}