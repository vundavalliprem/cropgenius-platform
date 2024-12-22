import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!container.current || map.current) return;

    const initializeMap = () => {
      try {
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
        
        const mapInstance = new mapboxgl.Map({
          container: container.current!,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        mapInstance.once('load', () => {
          if (!isMounted.current) return;
          
          mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
          setIsMapReady(true);
        });

        map.current = mapInstance;
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMounted.current) {
          setMapError('Failed to initialize map. Please try again later.');
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
      setIsMapReady(false);
    };
  }, [container]);

  return { map, mapError, isMapReady };
};