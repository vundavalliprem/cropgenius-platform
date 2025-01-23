import React, { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchLocation } from "@/services/tomtom";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ value, onChange, placeholder, className }: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string }>>([]);

  const handleSearch = async (search: string) => {
    if (!search) {
      setSearchResults([]);
      return;
    }

    try {
      const location = await searchLocation(search);
      if (location) {
        setSearchResults([{ id: `${location.lat},${location.lng}`, name: search }]);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value || placeholder || "Search location..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search location..."
            onValueChange={handleSearch}
          />
          <CommandEmpty>No location found.</CommandEmpty>
          <CommandGroup>
            {searchResults.map((result) => (
              <CommandItem
                key={result.id}
                value={result.name}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === result.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {result.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}