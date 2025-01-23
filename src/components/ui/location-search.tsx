import React, { useState, useEffect, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ value, onChange, placeholder, className }: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ place_name: string }>>([]);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const { data: { TOMTOM_API_KEY }, error } = await supabase
        .functions.invoke('get-secret', {
          body: { name: 'TOMTOM_API_KEY' }
        });

      if (error || !TOMTOM_API_KEY) {
        console.error('Failed to get TomTom API key:', error);
        return;
      }

      const response = await fetch(
        `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?` +
        new URLSearchParams({
          key: TOMTOM_API_KEY,
          limit: '5',
        })
      );

      if (!response.ok) throw new Error('Failed to fetch suggestions');

      const data = await response.json();
      setSuggestions(data.results.map((result: any) => ({
        place_name: result.address.freeformAddress
      })));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      searchLocations(value);
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value || placeholder || "Select location..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search location..."
            value={value}
            onValueChange={onChange}
          />
          <CommandEmpty>No location found.</CommandEmpty>
          <CommandGroup>
            {suggestions.map((suggestion, index) => (
              <CommandItem
                key={index}
                onSelect={() => {
                  onChange(suggestion.place_name);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === suggestion.place_name ? "opacity-100" : "opacity-0"
                  )}
                />
                {suggestion.place_name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}