import React from 'react';
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface FavoriteCitiesProps {
  onCitySelect: (lat: number, lng: number, cityName: string) => void;
}

export function FavoriteCities({ onCitySelect }: FavoriteCitiesProps) {
  const { toast } = useToast();

  const { data: favorites, refetch } = useQuery({
    queryKey: ['favorite-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorite_cities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('favorite_cities')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove city from favorites",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "City removed from favorites",
    });
    refetch();
  };

  if (!favorites?.length) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No favorite cities yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {favorites.map((city) => (
        <div key={city.id} className="flex items-center justify-between gap-2 p-2 bg-background rounded-lg">
          <Button
            variant="ghost"
            className="flex-1 justify-start"
            onClick={() => onCitySelect(Number(city.lat), Number(city.lng), city.city_name)}
          >
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            {city.city_name}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(city.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}