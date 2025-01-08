import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

export type AreaUnit = keyof typeof UNITS;

export const UNITS = {
  sqMeters: { label: "Square Meters", multiplier: 1 },
  hectares: { label: "Hectares", multiplier: 0.0001 },
  acres: { label: "Acres", multiplier: 0.000247105 },
} as const;

export const useAreaCalculation = () => {
  const { toast } = useToast();
  const [selectedUnit, setSelectedUnitState] = useState<AreaUnit>("sqMeters");
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);

  const requestLocation = useCallback(async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      return [
        Number(position.coords.longitude.toFixed(6)),
        Number(position.coords.latitude.toFixed(6))
      ] as [number, number];
    } catch (error) {
      toast({
        title: "Location access denied",
        description: "Please enable location access to use GPS tracking",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const setSelectedUnit = useCallback((unit: AreaUnit) => {
    if (calculatedArea !== null) {
      const currentArea = calculatedArea / UNITS[selectedUnit].multiplier;
      const newArea = Number((currentArea * UNITS[unit].multiplier).toFixed(2));
      setCalculatedArea(newArea);
    }
    setSelectedUnitState(unit);
  }, [calculatedArea, selectedUnit]);

  return {
    selectedUnit,
    setSelectedUnit,
    calculatedArea,
    setCalculatedArea,
    requestLocation,
  };
};