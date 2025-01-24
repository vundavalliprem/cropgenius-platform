import React, { useCallback, useState } from 'react';
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { searchLocation } from '@/services/here';
import { cn } from "@/lib/utils";
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
    if (!search.trim()) {
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
        description: "Failed to search location. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return (
    <Command
      className={cn(
        "relative rounded-lg border shadow-md",
        className
      )}
    >
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            handleSearch(e.target.value);
          }}
          className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
              className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
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