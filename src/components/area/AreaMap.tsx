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
  const { isReady, error: mapError } = useMapInitialization();
  const {
    selectedUnit,
    setSelectedUnit,
    calculatedArea,
    setCalculatedArea,
    requestLocation,
  } = useAreaCalculation();

  React.useEffect(() => {
    if (!mapContainer.current || !isReady) return;

    let mounted = true;
    let mapInstance: mapboxgl.Map | null = null;
    let drawInstance: MapboxDraw | null = null;

    const calculateArea = () => {
      if (!drawInstance || !mounted) return;
      const data = drawInstance.getAll();
      if (!data?.features.length) {
        setCalculatedArea(null);
        return;
      }
      const area = turf.area(data);
      const multiplier = UNITS[selectedUnit].multiplier;
      setCalculatedArea(Number((area * multiplier).toFixed(2)));
    };

    const initMap = () => {
      try {
        mapInstance = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        drawInstance = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          }
        });

        mapInstance.addControl(drawInstance);
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

        mapInstance.on('draw.create', calculateArea);
        mapInstance.on('draw.delete', calculateArea);
        mapInstance.on('draw.update', calculateArea);
      } catch (error) {
        console.error('Map initialization error:', error);
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstance) {
        mapInstance.off('draw.create', calculateArea);
        mapInstance.off('draw.delete', calculateArea);
        mapInstance.off('draw.update', calculateArea);
        if (drawInstance) {
          mapInstance.removeControl(drawInstance);
        }
        mapInstance.remove();
      }
      mapInstance = null;
      drawInstance = null;
    };
  }, [isReady, selectedUnit, setCalculatedArea]);

  const handleStartDrawing = () => {
    const drawControl = document.querySelector('.mapbox-gl-draw_polygon');
    if (drawControl) {
      (drawControl as HTMLElement).click();
    }
  };

  const handleClear = () => {
    const trashControl = document.querySelector('.mapbox-gl-draw_trash');
    if (trashControl) {
      (trashControl as HTMLElement).click();
      setCalculatedArea(null);
    }
  };

  const handleLocationRequest = async () => {
    try {
      const coords = await requestLocation();
      if (!coords || !mapContainer.current || !isReady) return;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: coords,
        zoom: 15,
      });

      return () => {
        if (mapInstance) {
          mapInstance.remove();
        }
      };
    } catch (error) {
      console.error('Location request error:', error);
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
            className="bg-primary-500 hover:bg-primary-600"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Start Drawing
          </Button>
          <Button 
            variant="outline" 
            onClick={handleLocationRequest}
            disabled={!isReady}
            className="border-primary-300 hover:bg-primary-100"
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
            <SelectTrigger className="w-[180px] border-primary-300">
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
          <div className="p-4 bg-primary-100 rounded-lg">
            <p className="text-lg font-semibold text-primary-600">
              Calculated Area: {calculatedArea} {UNITS[selectedUnit].label}
            </p>
          </div>
        )}
        <div className="h-[600px] relative rounded-lg overflow-hidden shadow-lg">
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