import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!container.current) return;

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
      
      const mapInstance = new mapboxgl.Map({
        container: container.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902] as [number, number],
        zoom: 15,
      });

      map.current = mapInstance;
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please try again later.');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [container]);

  return { map, mapError };
};