import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";

interface LogisticsMapProps {
  className?: string;
}

interface RouteFeature {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export function LogisticsMap({ className }: LogisticsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initializeMap = () => {
      try {
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
        
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-95.7129, 37.0902],
          zoom: 3,
        });

        mapInstance.once('load', () => {
          if (!isMounted.current || !mapInstance) {
            mapInstance.remove();
            return;
          }

          mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

          const route: RouteFeature = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [-122.4194, 37.7749],
                [-118.2437, 34.0522],
                [-112.0740, 33.4484],
                [-96.7970, 32.7767],
              ],
            },
          };

          mapInstance.addSource('route', {
            type: 'geojson',
            data: route,
          });

          mapInstance.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#2D5A27',
              'line-width': 3,
              'line-dasharray': [2, 2],
            },
          });

          route.geometry.coordinates.forEach((coord) => {
            new mapboxgl.Marker({ color: '#2D5A27' })
              .setLngLat(coord)
              .addTo(mapInstance);
          });
        });

        map.current = mapInstance;
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMounted.current) {
          setMapError('Failed to initialize map. Please try again later.');
        }
      }
    };

    const timeoutId = setTimeout(initializeMap, 100);

    return () => {
      clearTimeout(timeoutId);
      isMounted.current = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <Card title="Logistics Tracking" description="Real-time shipment tracking and route visualization" className={className}>
      <div className="h-[400px] relative rounded-lg overflow-hidden">
        {mapError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500">
            {mapError}
          </div>
        ) : (
          <div ref={mapContainer} className="absolute inset-0" />
        )}
      </div>
    </Card>
  );
}