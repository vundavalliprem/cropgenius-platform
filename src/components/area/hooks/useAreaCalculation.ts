import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

export const UNITS = {
  acres: { label: 'Acres', multiplier: 0.000247105 },
  hectares: { label: 'Hectares', multiplier: 0.0001 },
  sqMeters: { label: 'Square Meters', multiplier: 1 },
  sqYards: { label: 'Square Yards', multiplier: 1.19599 }
} as const;

export type AreaUnit = keyof typeof UNITS;

export const useAreaCalculation = () => {
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [selectedUnit, setSelectedUnit] = useState<AreaUnit>('acres');
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const calculateArea = useCallback((coords: [number, number][]) => {
    if (coords.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i][0] * coords[j][1];
      area -= coords[j][0] * coords[i][1];
    }
    area = Math.abs(area) / 2;
    
    const convertedArea = area * UNITS[selectedUnit].multiplier;
    return Number(convertedArea.toFixed(2));
  }, [selectedUnit]);

  const requestLocation = useCallback(async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      if (!mountedRef.current) return null;

      toast({
        title: "Location accessed",
        description: "Map centered to your current location",
      });
      
      return [position.coords.longitude, position.coords.latitude] as [number, number];
    } catch (error) {
      if (mountedRef.current) {
        toast({
          title: "Location access denied",
          description: "Please enable location access to use GPS tracking",
          variant: "destructive",
        });
      }
      return null;
    }
  }, []);

  const updateCoordinates = useCallback((newCoords: [number, number][]) => {
    if (mountedRef.current) {
      setCoordinates(newCoords);
    }
  }, []);

  const updateCalculatedArea = useCallback((area: number | null) => {
    if (mountedRef.current) {
      setCalculatedArea(area);
    }
  }, []);

  const updateSelectedUnit = useCallback((unit: AreaUnit) => {
    if (mountedRef.current) {
      setSelectedUnit(unit);
    }
  }, []);

  return {
    coordinates,
    setCoordinates: updateCoordinates,
    selectedUnit,
    setSelectedUnit: updateSelectedUnit,
    calculatedArea,
    setCalculatedArea: updateCalculatedArea,
    calculateArea,
    requestLocation,
  };
};