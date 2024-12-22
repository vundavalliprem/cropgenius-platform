import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    let mapInstance: mapboxgl.Map | null = null;

    const initializeMap = async () => {
      if (!container.current) return;

      try {
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
        
        mapInstance = new mapboxgl.Map({
          container: container.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902] as [number, number],
          zoom: 15,
        });

        // Wait for map to load before setting it as ready
        await new Promise<void>((resolve) => {
          mapInstance?.once('load', () => {
            setIsMapReady(true);
            resolve();
          });
        });

        if (mapInstance) {
          mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
          map.current = mapInstance;
        }

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map. Please try again later.');
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (mapInstance) {
        setIsMapReady(false);
        mapInstance.remove();
        map.current = null;
      }
    };
  }, [container]);

  return { map, mapError, isMapReady };
};