import React, { useState, useCallback } from 'react';
import { Command } from "cmdk";
import { searchLocation } from '@/services/here';
import { useToast } from "@/hooks/use-toast";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ value, onChange, placeholder = "Search location...", className }: LocationSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    lat: number;
    lng: number;
    address: string;
  }>>([]);
  const { toast } = useToast();

  const handleSearch = useCallback(async (search: string) => {
    if (!search) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchLocation(search);
      setSearchResults(results || []);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "Failed to search location",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return (
    <Command className={className}>
      <div className="flex items-center border rounded-md">
        <Command.Input
          value={value}
          onValueChange={onChange}
          onInput={(e) => handleSearch(e.currentTarget.value)}
          className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={placeholder}
        />
      </div>
      {isLoading && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Searching...
        </div>
      )}
      {searchResults.length > 0 && (
        <div className="absolute mt-2 w-full rounded-md border bg-popover p-2 shadow-md">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="cursor-pointer p-2 hover:bg-accent hover:text-accent-foreground rounded-sm text-sm"
              onClick={() => {
                onChange(result.address);
                setSearchResults([]);
              }}
            >
              {result.address}
            </div>
          ))}
        </div>
      )}
    </Command>
  );
}