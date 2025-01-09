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
  const { isReady, error: mapError } = useMapInitialization();
  const {
    selectedUnit,
    setSelectedUnit,
    calculatedArea,
    setCalculatedArea,
    requestLocation,
  } = useAreaCalculation();

  // Initialize map
  useEffect(() => {
    if (!isReady || !mapContainer.current) return;

    let map: mapboxgl.Map | null = null;
    let draw: MapboxDraw | null = null;

    try {
      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'simple_select'
      });

      const updateArea = () => {
        if (!draw) return;
        const data = draw.getAll();
        if (!data?.features.length) {
          setCalculatedArea(null);
          return;
        }
        const area = turf.area(data);
        const multiplier = UNITS[selectedUnit].multiplier;
        setCalculatedArea(Number((area * multiplier).toFixed(2)));
      };

      map.once('load', () => {
        if (!map || !draw) return;
        map.addControl(draw);
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      });

      map.on('draw.create', updateArea);
      map.on('draw.delete', updateArea);
      map.on('draw.update', updateArea);

      return () => {
        if (map) {
          map.off('draw.create', updateArea);
          map.off('draw.delete', updateArea);
          map.off('draw.update', updateArea);
          
          if (draw) {
            map.removeControl(draw);
          }
          map.remove();
        }
      };
    } catch (error) {
      console.error('Map initialization error:', error);
    }
  }, [isReady, selectedUnit]);

  const handleStartDrawing = () => {
    const map = mapContainer.current?.querySelector('.mapboxgl-map');
    if (!map) return;
    const drawControl = (map as any)._controls.find((c: any) => c instanceof MapboxDraw);
    if (drawControl) {
      drawControl.changeMode('draw_polygon');
    }
  };

  const handleClear = () => {
    const map = mapContainer.current?.querySelector('.mapboxgl-map');
    if (!map) return;
    const drawControl = (map as any)._controls.find((c: any) => c instanceof MapboxDraw);
    if (drawControl) {
      drawControl.deleteAll();
      setCalculatedArea(null);
    }
  };

  const handleLocationRequest = async () => {
    const map = mapContainer.current?.querySelector('.mapboxgl-map');
    if (!map) return;
    const coords = await requestLocation();
    if (coords) {
      (map as any).flyTo({
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