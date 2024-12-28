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
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [selectedUnit, setSelectedUnit] = useState<AreaUnit>("sqMeters");
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);

  const calculateArea = useCallback((coords: [number, number][]) => {
    if (coords.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i][0] * coords[j][1];
      area -= coords[j][0] * coords[i][1];
    }
    area = Math.abs(area) / 2;
    
    const multiplier = UNITS[selectedUnit].multiplier;
    return Number((area * multiplier).toFixed(2));
  }, [selectedUnit]);

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

  return {
    coordinates,
    setCoordinates,
    selectedUnit,
    setSelectedUnit,
    calculatedArea,
    setCalculatedArea,
    calculateArea,
    requestLocation,
  };
};