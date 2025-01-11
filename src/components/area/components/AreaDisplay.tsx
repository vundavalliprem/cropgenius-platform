import React from 'react';
import { UNITS, AreaUnit } from '../hooks/useAreaCalculation';

interface AreaDisplayProps {
  calculatedArea: number | null;
  selectedUnit: AreaUnit;
}

export function AreaDisplay({ calculatedArea, selectedUnit }: AreaDisplayProps) {
  if (calculatedArea === null) return null;

  return (
    <div className="p-4 bg-primary-100 rounded-lg">
      <p className="text-lg font-semibold text-primary-600">
        Calculated Area: {calculatedArea} {UNITS[selectedUnit].label}
      </p>
    </div>
  );
}