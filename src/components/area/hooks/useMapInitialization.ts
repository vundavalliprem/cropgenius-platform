import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!container.current) return;

    let map: mapboxgl.Map | null = null;

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
      
      map = new mapboxgl.Map({
        container: container.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      map.once('load', () => {
        if (map) {
          map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          mapRef.current = map;
          setIsReady(true);
        }
      });

    } catch (err) {
      setError('Failed to initialize map. Please try again later.');
      console.error('Error initializing map:', err);
    }

    return () => {
      if (map) {
        map.remove();
        mapRef.current = null;
        setIsReady(false);
      }
    };
  }, [container]);

  const getMap = () => mapRef.current;

  return {
    isReady,
    error,
    getMap,
  };
};