import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const loadHandlerRef = useRef<(() => void) | null>(null);
  const errorHandlerRef = useRef<((e: ErrorEvent) => void) | null>(null);

  useEffect(() => {
    if (!container.current) {
      setError('Map container not found');
      return;
    }

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoidnVuZGF2YWxsaXByZW0iLCJhIjoiY201bzI3M3pjMGdwZDJqczh0dzl0OXVveSJ9.YyEzTyV_TdB8lcKibGn5Yg';
      
      const mapInstance = new mapboxgl.Map({
        container: container.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      loadHandlerRef.current = () => {
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapRef.current = mapInstance;
        setIsReady(true);
      };

      errorHandlerRef.current = (e: ErrorEvent) => {
        console.error('Map error:', e);
        setError('Failed to initialize map. Please try again later.');
      };

      if (loadHandlerRef.current) {
        mapInstance.once('load', loadHandlerRef.current);
      }
      
      if (errorHandlerRef.current) {
        mapInstance.on('error', errorHandlerRef.current);
      }

      return () => {
        if (loadHandlerRef.current) {
          mapInstance.off('load', loadHandlerRef.current);
        }
        if (errorHandlerRef.current) {
          mapInstance.off('error', errorHandlerRef.current);
        }
        mapInstance.remove();
        mapRef.current = null;
        setIsReady(false);
      };
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map. Please try again later.');
    }
  }, [container]);

  const getMap = () => mapRef.current;

  return {
    isReady,
    error,
    getMap,
  };
};