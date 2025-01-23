import React, { useState, useCallback } from 'react';
import { Command } from "cmdk";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchLocation } from '@/services/tomtom';
import { useToast } from "@/hooks/use-toast";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ value, onChange, placeholder, className }: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ value: string; label: string }>>([]);
  const { toast } = useToast();

  const handleSearch = useCallback(async (search: string) => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const location = await searchLocation(search);
      if (location) {
        setSuggestions([
          {
            value: location.address,
            label: location.address,
          },
        ]);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        title: "Search Error",
        description: "Failed to search location. Please try again.",
        variant: "destructive",
      });
      setSuggestions([]);
    }
  }, [toast]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            className
          )}
        >
          {value || placeholder || "Select location..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <Command.Input 
            placeholder={placeholder || "Search location..."} 
            onValueChange={handleSearch}
            className="h-9 px-3"
          />
          <Command.Empty>No location found.</Command.Empty>
          <Command.Group>
            {suggestions.map((suggestion) => (
              <Command.Item
                key={suggestion.value}
                value={suggestion.value}
                onSelect={(value) => {
                  onChange(value);
                  setOpen(false);
                }}
                className="px-3 py-2 cursor-pointer hover:bg-accent"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === suggestion.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {suggestion.label}
              </Command.Item>
            ))}
          </Command.Group>
        </Command>
      </PopoverContent>
    </Popover>
  );
}