import React, { useRef, useState, useEffect } from 'react';
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
  const { isReady, error: mapError, getMap } = useMapInitialization(mapContainer);
  const {
    selectedUnit,
    setSelectedUnit,
    calculatedArea,
    setCalculatedArea,
    requestLocation,
  } = useAreaCalculation();

  useEffect(() => {
    if (!isReady) return;

    const map = getMap();
    if (!map) return;

    // Create a new draw instance
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'simple_select'
    });

    // Add draw control to map
    map.addControl(draw);

    // Define update area callback
    const updateAreaCallback = () => {
      const data = draw.getAll();
      if (!data?.features.length) {
        setCalculatedArea(null);
        return;
      }

      const area = turf.area(data);
      const multiplier = UNITS[selectedUnit].multiplier;
      setCalculatedArea(Number((area * multiplier).toFixed(2)));
    };

    // Add event listeners
    map.on('draw.create', updateAreaCallback);
    map.on('draw.delete', updateAreaCallback);
    map.on('draw.update', updateAreaCallback);

    // Store draw instance in a local variable for handlers
    const drawInstance = draw;

    // Cleanup function
    return () => {
      if (!map || !drawInstance) return;

      // Remove event listeners first
      map.off('draw.create', updateAreaCallback);
      map.off('draw.delete', updateAreaCallback);
      map.off('draw.update', updateAreaCallback);

      // Then remove the draw control
      try {
        map.removeControl(drawInstance);
      } catch (error) {
        console.error('Error removing draw control:', error);
      }
    };
  }, [isReady, selectedUnit]);

  const handleStartDrawing = () => {
    if (!isReady) return;
    const map = getMap();
    if (!map) return;

    // Find the draw control directly from the map's _controls array
    const drawControl = (map as any)._controls.find(
      (control: any) => control instanceof MapboxDraw
    );
    
    if (drawControl) {
      drawControl.changeMode('draw_polygon');
    }
  };

  const handleClear = () => {
    if (!isReady) return;
    const map = getMap();
    if (!map) return;

    // Find the draw control directly from the map's _controls array
    const drawControl = (map as any)._controls.find(
      (control: any) => control instanceof MapboxDraw
    );
    
    if (drawControl) {
      drawControl.deleteAll();
      setCalculatedArea(null);
    }
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