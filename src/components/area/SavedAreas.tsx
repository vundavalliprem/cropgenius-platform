import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface SavedArea {
  id: string;
  name: string;
  area: number;
  unit: string;
}

export function SavedAreas() {
  const queryClient = useQueryClient();

  const { data: savedAreas = [] } = useQuery({
    queryKey: ['savedAreas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_areas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_areas')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAreas'] });
      toast({
        title: "Area deleted",
        description: "The area has been successfully deleted.",
      });
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the area.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card title="Saved Areas" description="Your saved field measurements">
      <div className="divide-y">
        {savedAreas.map((area: SavedArea) => (
          <div key={area.id} className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">{area.name}</h4>
              <p className="text-sm text-muted-foreground">
                {area.area} {area.unit}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDelete(area.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}