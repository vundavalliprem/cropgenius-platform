import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const initializeMap = async () => {
      if (!container.current) {
        if (isMounted.current) {
          setError('Map container not found');
        }
        return;
      }

      try {
        mapboxgl.accessToken = 'pk.eyJ1IjoidnVuZGF2YWxsaXByZW0iLCJhIjoiY201bzI3M3pjMGdwZDJqczh0dzl0OXVveSJ9.YyEzTyV_TdB8lcKibGn5Yg';
        
        const map = new mapboxgl.Map({
          container: container.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        map.on('load', () => {
          if (!isMounted.current) {
            map.remove();
            return;
          }
          
          map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          mapRef.current = map;
          setIsReady(true);
        });

        map.on('error', (e) => {
          if (!isMounted.current) return;
          console.error('Map error:', e);
          setError('Failed to initialize map. Please try again later.');
        });

      } catch (err) {
        if (!isMounted.current) return;
        console.error('Error initializing map:', err);
        setError('Failed to initialize map. Please try again later.');
      }
    };

    initializeMap();

    return () => {
      isMounted.current = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
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