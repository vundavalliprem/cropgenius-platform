import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UNITS, AreaUnit } from '../hooks/useAreaCalculation';

interface MapControlsProps {
  isReady: boolean;
  selectedUnit: AreaUnit;
  onUnitChange: (value: AreaUnit) => void;
  onStartDrawing: () => void;
  onLocationRequest: () => void;
  onClear: () => void;
}

export function MapControls({
  isReady,
  selectedUnit,
  onUnitChange,
  onStartDrawing,
  onLocationRequest,
  onClear
}: MapControlsProps) {
  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Pencil className="h-5 w-5 text-[hsl(var(--neon-blue))]" />
        Drawing Controls
      </h3>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onStartDrawing}
          disabled={!isReady}
          className="glass-panel bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))] hover:opacity-90 transition-all hover:scale-105 border-0"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Start Drawing
        </Button>
        <Button 
          variant="outline" 
          onClick={onLocationRequest}
          disabled={!isReady}
          className="glass-panel border-[hsl(var(--neon-blue))]/30 hover:bg-[hsl(var(--neon-blue))]/10 transition-all hover:scale-105"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Use GPS
        </Button>
        <Button 
          variant="outline"
          onClick={onClear}
          disabled={!isReady}
          className="glass-panel border-destructive/30 hover:bg-destructive/10 transition-all hover:scale-105"
        >
          Clear All
        </Button>
        <Select value={selectedUnit} onValueChange={onUnitChange}>
          <SelectTrigger className="w-[200px] glass-panel border-[hsl(var(--neon-blue))]/30">
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent className="glass-panel">
            {Object.entries(UNITS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}