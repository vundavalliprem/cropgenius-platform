import React, { useRef, useState, useEffect } from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { MapPin, Square, Hexagon, Circle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMapInitialization } from './hooks/useMapInitialization';
import { useAreaCalculation, UNITS, AreaUnit } from './hooks/useAreaCalculation';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';

interface AreaMapProps {
  className?: string;
}

type DrawingMode = 'polygon' | 'rectangle' | 'circle';

export function AreaMap({ className }: AreaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('polygon');
  const { isReady, error: mapError, getMap } = useMapInitialization(mapContainer);
  const {
    selectedUnit,
    setSelectedUnit,
    calculatedArea,
    setCalculatedArea,
    requestLocation,
  } = useAreaCalculation();

  useEffect(() => {
    if (isReady && getMap()) {
      const map = getMap();
      if (!map) return;

      // Initialize MapboxDraw if not already initialized
      if (!drawRef.current) {
        drawRef.current = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          },
          defaultMode: 'simple_select'
        });

        map.addControl(drawRef.current);

        // Calculate area when drawing is completed
        map.on('draw.create', updateArea);
        map.on('draw.delete', updateArea);
        map.on('draw.update', updateArea);
      }

      return () => {
        if (map && drawRef.current) {
          map.removeControl(drawRef.current);
        }
      };
    }
  }, [isReady]);

  const updateArea = () => {
    const data = drawRef.current?.getAll();
    if (!data?.features.length) {
      setCalculatedArea(null);
      return;
    }

    const area = turf.area(data);
    const multiplier = UNITS[selectedUnit].multiplier;
    setCalculatedArea(Number((area * multiplier).toFixed(2)));
  };

  const handleDrawingModeChange = (mode: DrawingMode) => {
    if (!drawRef.current || !isReady) return;
    
    setDrawingMode(mode);
    drawRef.current.changeMode(mode === 'circle' ? 'circle' : 'draw_' + mode);
  };

  const handleClear = () => {
    if (!drawRef.current) return;
    drawRef.current.deleteAll();
    setCalculatedArea(null);
  };

  const handleLocationRequest = async () => {
    if (!isReady) return;
    const coords = await requestLocation();
    const map = getMap();
    if (coords && map) {
      map.flyTo({
        center: coords as [number, number],
        zoom: 15
      });
    }
  };

  return (
    <Card title="Area Calculator" description="Draw or track field boundaries" className={className}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <Button
              onClick={() => handleDrawingModeChange('polygon')}
              variant={drawingMode === 'polygon' ? "default" : "outline"}
              disabled={!isReady}
            >
              <Hexagon className="mr-2 h-4 w-4" />
              Polygon
            </Button>
            <Button
              onClick={() => handleDrawingModeChange('rectangle')}
              variant={drawingMode === 'rectangle' ? "default" : "outline"}
              disabled={!isReady}
            >
              <Square className="mr-2 h-4 w-4" />
              Rectangle
            </Button>
            <Button
              onClick={() => handleDrawingModeChange('circle')}
              variant={drawingMode === 'circle' ? "default" : "outline"}
              disabled={!isReady}
            >
              <Circle className="mr-2 h-4 w-4" />
              Circle
            </Button>
          </div>
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