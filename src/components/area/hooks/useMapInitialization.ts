import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!container.current) return;

    try {
      // Initialize map only if it hasn't been initialized yet
      if (!map.current) {
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
        
        const mapInstance = new mapboxgl.Map({
          container: container.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902] as [number, number],
          zoom: 15,
        });

        // Set up load handler before assigning to ref
        mapInstance.once('load', () => {
          if (mapInstance) {
            mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
            setIsMapReady(true);
          }
        });

        // Store the instance in ref after setup
        map.current = mapInstance;
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please try again later.');
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setIsMapReady(false);
      }
    };
  }, [container]);

  return { map, mapError, isMapReady };
};