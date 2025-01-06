import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!container.current) return;

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
      
      const map = new mapboxgl.Map({
        container: container.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      map.once('load', () => {
        if (!isMounted.current) return;
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapRef.current = map;
        setIsReady(true);
      });

      return () => {
        isMounted.current = false;
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        setIsReady(false);
      };

    } catch (err) {
      console.error('Error initializing map:', err);
      if (isMounted.current) {
        setError('Failed to initialize map. Please try again later.');
      }
    }
  }, [container]);

  const getMap = () => mapRef.current;

  return {
    isReady,
    error,
    getMap,
  };
};