import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

export type AreaUnit = keyof typeof UNITS;

export const UNITS = {
  acres: { label: "Acres", multiplier: 0.000247105 },
  cents: { label: "Cents", multiplier: 0.0247105 },
  sqKilometers: { label: "Square Kilometers", multiplier: 0.000001 },
  sqYards: { label: "Square Yards", multiplier: 1.19599 },
  sqMiles: { label: "Square Miles", multiplier: 3.861e-7 },
  gunta: { label: "Gunta", multiplier: 0.00988421 },
  hectares: { label: "Hectares", multiplier: 0.0001 },
  sqMeters: { label: "Square Meters", multiplier: 1 },
} as const;

export const useAreaCalculation = () => {
  const { toast } = useToast();
  const [selectedUnit, setSelectedUnitState] = useState<AreaUnit>("acres");
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