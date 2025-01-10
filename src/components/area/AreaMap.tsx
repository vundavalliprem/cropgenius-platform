import React from 'react';
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
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const drawRef = React.useRef<MapboxDraw | null>(null);
  const { isReady, error: mapError } = useMapInitialization();
  const {
    selectedUnit,
    setSelectedUnit,
    calculatedArea,
    setCalculatedArea,
    requestLocation,
  } = useAreaCalculation();

  // Function to update area calculations
  const updateArea = React.useCallback(() => {
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

  const handleStartDrawing = React.useCallback(() => {
    if (drawRef.current) {
      drawRef.current.changeMode('draw_polygon');
    }
  }, []);

  const handleClear = React.useCallback(() => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      setCalculatedArea(null);
    }
  }, [setCalculatedArea]);

  const handleLocationRequest = React.useCallback(async () => {
    const coords = await requestLocation();
    if (coords && mapRef.current) {
      mapRef.current.flyTo({
        center: coords,
        zoom: 15
      });
    }
  }, [requestLocation]);

  React.useEffect(() => {
    if (!isReady || !mapContainer.current) return;

    // Cleanup any existing instances
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-95.7129, 37.0902],
      zoom: 15,
    });

    // Initialize draw control
    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'simple_select'
    });

    const map = mapRef.current;
    const draw = drawRef.current;

    // Add controls after map loads
    map.once('load', () => {
      map.addControl(draw);
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    });

    // Add event listeners
    const boundUpdateArea = updateArea;
    map.on('draw.create', boundUpdateArea);
    map.on('draw.delete', boundUpdateArea);
    map.on('draw.update', boundUpdateArea);

    // Cleanup function
    return () => {
      if (mapRef.current) {
        const map = mapRef.current;
        map.off('draw.create', boundUpdateArea);
        map.off('draw.delete', boundUpdateArea);
        map.off('draw.update', boundUpdateArea);
        
        if (drawRef.current) {
          map.removeControl(drawRef.current);
          drawRef.current = null;
        }
        
        map.remove();
        mapRef.current = null;
      }
    };
  }, [isReady, updateArea]);

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