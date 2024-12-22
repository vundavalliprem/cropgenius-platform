import React, { useRef, useState } from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { MapPin, Square } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMapInitialization } from './hooks/useMapInitialization';
import { useAreaCalculation, UNITS, AreaUnit } from './hooks/useAreaCalculation';
import 'mapbox-gl/dist/mapbox-gl.css';

interface AreaMapProps {
  className?: string;
}

export function AreaMap({ className }: AreaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { map, mapError, isMapReady } = useMapInitialization(mapContainer);
  const {
    coordinates,
    setCoordinates,
    selectedUnit,
    setSelectedUnit,
    calculatedArea,
    setCalculatedArea,
    calculateArea,
    requestLocation,
  } = useAreaCalculation();

  const handleDrawToggle = () => {
    if (!map.current || !isMapReady) return;

    if (isDrawing) {
      setIsDrawing(false);
      if (coordinates.length >= 3) {
        const area = calculateArea(coordinates);
        setCalculatedArea(area);
      }
    } else {
      setIsDrawing(true);
      setCoordinates([]);
      setCalculatedArea(null);

      const markers = document.getElementsByClassName('mapboxgl-marker');
      while (markers[0]) {
        markers[0].remove();
      }

      if (map.current.getLayer('area-polygon')) {
        map.current.removeLayer('area-polygon');
      }
      if (map.current.getSource('area-source')) {
        map.current.removeSource('area-source');
      }
    }
  };

  const handleLocationRequest = async () => {
    if (!isMapReady) return;
    const coords = await requestLocation();
    if (coords && map.current) {
      map.current.flyTo({
        center: coords as [number, number],
        zoom: 15
      });
    }
  };

  return (
    <Card title="Area Calculator" description="Draw or track field boundaries" className={className}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleDrawToggle}
            variant={isDrawing ? "destructive" : "default"}
            disabled={!isMapReady}
          >
            <Square className="mr-2 h-4 w-4" />
            {isDrawing ? "Finish Drawing" : "Start Drawing"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleLocationRequest}
            disabled={!isMapReady}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Use GPS
          </Button>
          <Select value={selectedUnit} onValueChange={(value: AreaUnit) => setSelectedUnit(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(UNITS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {calculatedArea !== null && (
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-lg font-semibold">
              Calculated Area: {calculatedArea} {UNITS[selectedUnit].label}
            </p>
          </div>
        )}
        <div className="h-[500px] relative rounded-lg overflow-hidden">
          {mapError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500">
              {mapError}
            </div>
          ) : (
            <div ref={mapContainer} className="absolute inset-0" />
          )}
        </div>
      </div>
    </Card>
  );
}