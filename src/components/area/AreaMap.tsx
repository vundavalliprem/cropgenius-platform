import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { MapPin, Square } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface AreaMapProps {
  className?: string;
}

const UNITS = {
  acres: { label: 'Acres', multiplier: 0.000247105 },
  hectares: { label: 'Hectares', multiplier: 0.0001 },
  sqMeters: { label: 'Square Meters', multiplier: 1 },
  sqYards: { label: 'Square Yards', multiplier: 1.19599 }
};

export function AreaMap({ className }: AreaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [selectedUnit, setSelectedUnit] = useState<keyof typeof UNITS>('acres');
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);

  const requestLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      if (map.current) {
        map.current.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 15
        });
      }
      toast({
        title: "Location accessed",
        description: "Map centered to your current location",
      });
    } catch (error) {
      toast({
        title: "Location access denied",
        description: "Please enable location access to use GPS tracking",
        variant: "destructive",
      });
    }
  };

  const calculateArea = (coords: [number, number][]) => {
    if (coords.length < 3) return 0;
    
    // Calculate area using the Shoelace formula
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i][0] * coords[j][1];
      area -= coords[j][0] * coords[i][1];
    }
    area = Math.abs(area) / 2;
    
    // Convert to selected unit
    const convertedArea = area * UNITS[selectedUnit].multiplier;
    return Number(convertedArea.toFixed(2));
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
      
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      map.current = mapInstance;
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

      mapInstance.on('click', (e) => {
        if (!isDrawing) return;

        const newCoord: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        setCoordinates(prev => [...prev, newCoord]);

        new mapboxgl.Marker({ color: '#2D5A27' })
          .setLngLat(newCoord)
          .addTo(mapInstance);

        if (coordinates.length >= 2) {
          const data = {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[...coordinates, newCoord, coordinates[0]]],
            },
            properties: {},
          };

          if (mapInstance.getLayer('area-polygon')) {
            mapInstance.removeLayer('area-polygon');
          }
          if (mapInstance.getSource('area-source')) {
            mapInstance.removeSource('area-source');
          }

          mapInstance.addSource('area-source', {
            type: 'geojson',
            data: data as any,
          });

          mapInstance.addLayer({
            id: 'area-polygon',
            type: 'fill',
            source: 'area-source',
            paint: {
              'fill-color': '#2D5A27',
              'fill-opacity': 0.3,
            },
          });

          const area = calculateArea([...coordinates, newCoord]);
          setCalculatedArea(area);
        }
      });

    } catch (error) {
      console.error('Error initializing area map:', error);
      setMapError('Failed to initialize area map. Please try again later.');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isDrawing, coordinates, selectedUnit]);

  const handleDrawToggle = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (coordinates.length >= 3) {
        const area = calculateArea(coordinates);
        setCalculatedArea(area);
        toast({
          title: "Area Calculated",
          description: `The area is ${area} ${UNITS[selectedUnit].label}`,
        });
      }
    } else {
      setIsDrawing(true);
      setCoordinates([]);
      setCalculatedArea(null);
      if (map.current) {
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
    }
  };

  return (
    <Card title="Area Calculator" description="Draw or track field boundaries" className={className}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleDrawToggle}
            variant={isDrawing ? "destructive" : "default"}
          >
            <Square className="mr-2 h-4 w-4" />
            {isDrawing ? "Finish Drawing" : "Start Drawing"}
          </Button>
          <Button variant="outline" onClick={requestLocation}>
            <MapPin className="mr-2 h-4 w-4" />
            Use GPS
          </Button>
          <Select value={selectedUnit} onValueChange={(value: keyof typeof UNITS) => setSelectedUnit(value)}>
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