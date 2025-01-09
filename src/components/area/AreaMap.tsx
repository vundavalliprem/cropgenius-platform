import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { MapPin, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMapInitialization } from './hooks/useMapInitialization';
import { useAreaCalculation, UNITS, AreaUnit } from './hooks/useAreaCalculation';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';

interface AreaMapProps {
  className?: string;
}

export function AreaMap({ className }: AreaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const { isReady, error: mapError, getMap } = useMapInitialization(mapContainer);
  const {
    selectedUnit,
    setSelectedUnit,
    calculatedArea,
    setCalculatedArea,
    requestLocation,
  } = useAreaCalculation();

  const updateArea = useCallback(() => {
    if (!drawRef.current) return;
    const data = drawRef.current.getAll();
    if (!data?.features.length) {
      setCalculatedArea(null);
      return;
    }
    const area = turf.area(data);
    const multiplier = UNITS[selectedUnit].multiplier;
    setCalculatedArea(Number((area * multiplier).toFixed(2)));
  }, [selectedUnit, setCalculatedArea]);

  useEffect(() => {
    if (!isReady) return;

    const map = getMap();
    if (!map) return;

    // Initialize draw instance if it doesn't exist
    if (!drawRef.current) {
      drawRef.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'simple_select'
      });
      
      // Add draw control to map
      map.addControl(drawRef.current);

      // Add event listeners
      map.on('draw.create', updateArea);
      map.on('draw.delete', updateArea);
      map.on('draw.update', updateArea);
    }

    // Cleanup function
    return () => {
      const currentMap = getMap();
      if (currentMap && drawRef.current) {
        // Remove event listeners first
        currentMap.off('draw.create', updateArea);
        currentMap.off('draw.delete', updateArea);
        currentMap.off('draw.update', updateArea);
        
        // Then remove the control if it exists on the map
        if (currentMap.hasControl(drawRef.current)) {
          currentMap.removeControl(drawRef.current);
        }
      }
      // Clear the ref
      drawRef.current = null;
    };
  }, [isReady, updateArea]);

  const handleStartDrawing = () => {
    if (!isReady || !drawRef.current) return;
    drawRef.current.changeMode('draw_polygon');
  };

  const handleClear = () => {
    if (!isReady || !drawRef.current) return;
    drawRef.current.deleteAll();
    setCalculatedArea(null);
  };

  const handleLocationRequest = async () => {
    if (!isReady) return;
    const coords = await requestLocation();
    const map = getMap();
    if (coords && map) {
      map.flyTo({
        center: coords,
        zoom: 15
      });
    }
  };

  return (
    <Card title="Area Calculator" description="Draw or track field boundaries" className={className}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleStartDrawing}
            variant="default"
            disabled={!isReady}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Start Drawing
          </Button>
          <Button 
            variant="outline" 
            onClick={handleLocationRequest}
            disabled={!isReady}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Use GPS
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleClear}
            disabled={!isReady}
          >
            Clear
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