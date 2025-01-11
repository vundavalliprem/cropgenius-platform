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
    <div className="flex flex-wrap gap-4">
      <Button
        onClick={onStartDrawing}
        variant="default"
        disabled={!isReady}
        className="bg-primary-500 hover:bg-primary-600"
      >
        <Pencil className="mr-2 h-4 w-4" />
        Start Drawing
      </Button>
      <Button 
        variant="outline" 
        onClick={onLocationRequest}
        disabled={!isReady}
        className="border-primary-300 hover:bg-primary-100"
      >
        <MapPin className="mr-2 h-4 w-4" />
        Use GPS
      </Button>
      <Button 
        variant="destructive" 
        onClick={onClear}
        disabled={!isReady}
      >
        Clear
      </Button>
      <Select value={selectedUnit} onValueChange={onUnitChange}>
        <SelectTrigger className="w-[180px] border-primary-300">
          <SelectValue placeholder="Select unit" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(UNITS).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}