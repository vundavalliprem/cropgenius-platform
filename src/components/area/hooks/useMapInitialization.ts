import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!container.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
    
    let mapInstance: mapboxgl.Map | null = null;

    try {
      mapInstance = new mapboxgl.Map({
        container: container.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      mapInstance.once('load', () => {
        if (!mountedRef.current) return;
        
        mapInstance?.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapInstanceRef.current = mapInstance;
        setIsReady(true);
      });

    } catch (err) {
      if (mountedRef.current) {
        setError('Failed to initialize map. Please try again later.');
        console.error('Error initializing map:', err);
      }
    }

    return () => {
      mountedRef.current = false;
      if (mapInstance) {
        mapInstance.remove();
        mapInstanceRef.current = null;
      }
      setIsReady(false);
    };
  }, [container]);

  const getMap = () => mapInstanceRef.current;

  return {
    isReady,
    error,
    getMap,
  };
};