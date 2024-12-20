import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { MapPin, Square } from "lucide-react";

interface AreaMapProps {
  className?: string;
}

export function AreaMap({ className }: AreaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);

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

      // Add click handler for drawing
      mapInstance.on('click', (e) => {
        if (!isDrawing) return;

        const newCoord: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        setCoordinates(prev => [...prev, newCoord]);

        // Add marker at clicked point
        new mapboxgl.Marker({ color: '#2D5A27' })
          .setLngLat(newCoord)
          .addTo(mapInstance);

        // Draw polygon if we have at least 3 points
        if (coordinates.length >= 2) {
          const data = {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[...coordinates, newCoord, coordinates[0]]],
            },
            properties: {},
          };

          // Remove existing layer and source if they exist
          if (mapInstance.getLayer('area-polygon')) {
            mapInstance.removeLayer('area-polygon');
          }
          if (mapInstance.getSource('area-source')) {
            mapInstance.removeSource('area-source');
          }

          // Add new layer
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
  }, [isDrawing, coordinates]);

  const handleDrawToggle = () => {
    if (isDrawing) {
      // Finish drawing
      setIsDrawing(false);
      // Calculate and display area
      if (coordinates.length >= 3) {
        // Area calculation would go here
        console.log('Area calculated for coordinates:', coordinates);
      }
    } else {
      // Start new drawing
      setIsDrawing(true);
      setCoordinates([]);
      // Clear existing markers and polygon
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
        <div className="flex gap-4">
          <Button
            onClick={handleDrawToggle}
            variant={isDrawing ? "destructive" : "default"}
          >
            <Square className="mr-2 h-4 w-4" />
            {isDrawing ? "Finish Drawing" : "Start Drawing"}
          </Button>
          <Button variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            Use GPS
          </Button>
        </div>
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