import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

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

        await new Promise((resolve) => {
          mapInstance?.once('load', resolve);
        });

        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current = mapInstance;

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map. Please try again later.');
      }
    };

    initializeMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        map.current = null;
      }
    };
  }, [container]);

  return { map, mapError };
};