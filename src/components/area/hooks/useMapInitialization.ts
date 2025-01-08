import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeMap = () => {
      if (!container.current) {
        setError('Map container not found');
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
          if (!mounted) return;
          map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          mapRef.current = map;
          setIsReady(true);
        });

        map.on('error', (e) => {
          if (!mounted) return;
          console.error('Map error:', e);
          setError('Failed to initialize map. Please try again later.');
        });

        return map;
      } catch (err) {
        console.error('Map initialization error:', err);
        if (mounted) {
          setError('Failed to initialize map. Please try again later.');
        }
        return null;
      }
    };

    const map = initializeMap();

    return () => {
      mounted = false;
      if (map) {
        map.remove();
      }
      mapRef.current = null;
      setIsReady(false);
    };
  }, [container]);

  const getMap = () => mapRef.current;

  return {
    isReady,
    error,
    getMap,
  };
};