import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";

interface WeatherMapProps {
  className?: string;
}

export function WeatherMap({ className }: WeatherMapProps) {
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
          zoom: 4,
        });

        mapInstance.once('load', () => {
          if (!isMounted.current || !mapInstance) return;

          mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

          // Add temperature heatmap layer
          mapInstance.addSource('temperature', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [-95.7129, 37.0902],
                  },
                  properties: {
                    temperature: 75,
                  },
                },
              ],
            },
          });

          mapInstance.addLayer({
            id: 'temperature-heat',
            type: 'heatmap',
            source: 'temperature',
            paint: {
              'heatmap-weight': ['interpolate', ['linear'], ['get', 'temperature'], 0, 0, 100, 1],
              'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(33,102,172,0)',
                0.2, 'rgb(103,169,207)',
                0.4, 'rgb(209,229,240)',
                0.6, 'rgb(253,219,199)',
                0.8, 'rgb(239,138,98)',
                1, 'rgb(178,24,43)',
              ],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
              'heatmap-opacity': 0.7,
            },
          });
        });

        map.current = mapInstance;
      } catch (error) {
        console.error('Error initializing weather map:', error);
        if (isMounted.current) {
          setMapError('Failed to initialize weather map. Please try again later.');
        }
      }
    };

    initializeMap();

    return () => {
      isMounted.current = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <Card title="Weather Map" description="Real-time weather conditions visualization" className={className}>
      <div className="h-[500px] relative rounded-lg overflow-hidden">
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