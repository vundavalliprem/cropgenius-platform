import React, { useState } from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { UNITS } from './hooks/useAreaCalculation';

interface SavedArea {
  id: string;
  name: string;
  area: number;
  unit: string;
}

export function SavedAreas() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('saved_areas')
        .update({ name })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAreas'] });
      toast({
        title: "Area updated",
        description: "The area name has been successfully updated.",
      });
      setEditingId(null);
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

  const handleEdit = (area: SavedArea) => {
    setEditingId(area.id);
    setEditName(area.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateMutation.mutateAsync({ id, name: editName });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the area.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getConversions = (area: number, unit: string) => {
    // Convert to square meters first
    const baseAreaInSqMeters = area / UNITS[unit as keyof typeof UNITS].multiplier;
    
    return {
      acres: Number((baseAreaInSqMeters * UNITS.acres.multiplier).toFixed(4)),
      cents: Number((baseAreaInSqMeters * UNITS.cents.multiplier).toFixed(2)),
      gunta: Number((baseAreaInSqMeters * UNITS.gunta.multiplier).toFixed(2)),
      sqYards: Number((baseAreaInSqMeters * UNITS.sqYards.multiplier).toFixed(2)),
      sqFeet: Number((baseAreaInSqMeters * 10.7639).toFixed(2)),
      sqMeters: Number(baseAreaInSqMeters.toFixed(2)),
      hectares: Number((baseAreaInSqMeters * UNITS.hectares.multiplier).toFixed(4)),
    };
  };

  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-semibold mb-4">Saved Areas</h3>
      <div className="space-y-3">
        {savedAreas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No saved areas yet. Draw and save your first area!
          </p>
        ) : (
          savedAreas.map((area: SavedArea) => {
            const conversions = getConversions(area.area, area.unit);
            const isExpanded = expandedId === area.id;
            const isEditing = editingId === area.id;

            return (
              <div key={area.id} className="glass-panel p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-background/50 border-[hsl(var(--neon-blue))]/30"
                          autoFocus
                        />
                        <Button 
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSaveEdit(area.id)}
                          className="hover:bg-[hsl(var(--neon-blue))]/10"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button 
                          size="icon"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-foreground">{area.name}</h4>
                        <p className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))] bg-clip-text text-transparent">
                          {area.area} {area.unit}
                        </p>
                      </>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(area)}
                        className="hover:bg-[hsl(var(--neon-blue))]/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(area.id)}
                        className="hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleExpanded(area.id)}
                        className="hover:bg-[hsl(var(--neon-blue))]/10"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t border-[hsl(var(--neon-blue))]/20 animate-fade-in">
                    <p className="text-xs font-medium text-muted-foreground mb-2">All Conversions:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-background/50">
                        <span className="text-muted-foreground">Acres:</span>
                        <span className="ml-2 font-semibold">{conversions.acres}</span>
                      </div>
                      <div className="p-2 rounded bg-background/50">
                        <span className="text-muted-foreground">Cents:</span>
                        <span className="ml-2 font-semibold">{conversions.cents}</span>
                      </div>
                      <div className="p-2 rounded bg-background/50">
                        <span className="text-muted-foreground">Gunta:</span>
                        <span className="ml-2 font-semibold">{conversions.gunta}</span>
                      </div>
                      <div className="p-2 rounded bg-background/50">
                        <span className="text-muted-foreground">Sq Yards:</span>
                        <span className="ml-2 font-semibold">{conversions.sqYards}</span>
                      </div>
                      <div className="p-2 rounded bg-background/50">
                        <span className="text-muted-foreground">Sq Feet:</span>
                        <span className="ml-2 font-semibold">{conversions.sqFeet}</span>
                      </div>
                      <div className="p-2 rounded bg-background/50">
                        <span className="text-muted-foreground">Sq Meters:</span>
                        <span className="ml-2 font-semibold">{conversions.sqMeters}</span>
                      </div>
                      <div className="p-2 rounded bg-background/50">
                        <span className="text-muted-foreground">Hectares:</span>
                        <span className="ml-2 font-semibold">{conversions.hectares}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}