import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UNITS, AreaUnit } from '../hooks/useAreaCalculation';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AreaDisplayProps {
  calculatedArea: number | null;
  selectedUnit: AreaUnit;
}

export function AreaDisplay({ calculatedArea, selectedUnit }: AreaDisplayProps) {
  const [areaName, setAreaName] = useState("");
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!calculatedArea || !areaName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for the area.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_areas')
        .insert({
          name: areaName.trim(),
          area: calculatedArea,
          unit: selectedUnit,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Area saved successfully!",
      });
      
      setAreaName("");
      queryClient.invalidateQueries({ queryKey: ['savedAreas'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the area.",
        variant: "destructive",
      });
    }
  };

  if (calculatedArea === null) return null;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-primary-100 rounded-lg">
        <p className="text-lg font-semibold text-primary-600">
          Calculated Area: {calculatedArea} {UNITS[selectedUnit].label}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder="Enter area name"
          value={areaName}
          onChange={(e) => setAreaName(e.target.value)}
        />
        <Button onClick={handleSave}>Save Area</Button>
      </div>

      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Area Conversion Reference:</h3>
        <ul className="space-y-1 text-sm">
          <li>1 acre = 100 cents</li>
          <li>1 acre = 40 Guntas</li>
          <li>1 acre = 0.4047 hectares</li>
          <li>1 acre = 4,840 square yards</li>
          <li>1 acre = 43,560 square feet</li>
          <li>1 acre = 4,046.86 square meters</li>
        </ul>
      </div>
    </div>
  );
}