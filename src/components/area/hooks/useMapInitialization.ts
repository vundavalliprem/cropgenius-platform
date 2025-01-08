import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!container.current) {
      setError('Map container not found');
      return;
    }

    let map: mapboxgl.Map | null = null;

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoidnVuZGF2YWxsaXByZW0iLCJhIjoiY201bzI3M3pjMGdwZDJqczh0dzl0OXVveSJ9.YyEzTyV_TdB8lcKibGn5Yg';
      
      map = new mapboxgl.Map({
        container: container.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      const onLoad = () => {
        if (map) {
          map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          mapRef.current = map;
          setIsReady(true);
        }
      };

      const onError = (e: ErrorEvent) => {
        console.error('Map error:', e);
        setError('Failed to initialize map. Please try again later.');
      };

      map.once('load', onLoad);
      map.on('error', onError);

      return () => {
        if (map) {
          // Remove event listeners first
          map.off('load', onLoad);
          map.off('error', onError);
          
          // Then remove the map
          map.remove();
          map = null;
        }
        
        // Clear the ref last
        if (mapRef.current) {
          mapRef.current = null;
        }
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