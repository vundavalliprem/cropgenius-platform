import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    let mapInstance: mapboxgl.Map | null = null;

    const initializeMap = async () => {
      if (!container.current) {
        if (isMounted.current) {
          setError('Map container not found');
        }
        return;
      }

      try {
        mapboxgl.accessToken = 'pk.eyJ1IjoidnVuZGF2YWxsaXByZW0iLCJhIjoiY201bzI3M3pjMGdwZDJqczh0dzl0OXVveSJ9.YyEzTyV_TdB8lcKibGn5Yg';
        
        mapInstance = new mapboxgl.Map({
          container: container.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        mapInstance.on('load', () => {
          if (!isMounted.current) return;
          
          mapInstance?.addControl(new mapboxgl.NavigationControl(), 'top-right');
          mapRef.current = mapInstance;
          setIsReady(true);
        });

        mapInstance.on('error', (e) => {
          if (!isMounted.current) return;
          console.error('Map error:', e);
          setError('Failed to initialize map. Please try again later.');
        });

      } catch (err) {
        console.error('Error initializing map:', err);
        if (isMounted.current) {
          setError('Failed to initialize map. Please try again later.');
        }
      }
    };

    initializeMap();

    return () => {
      isMounted.current = false;
      if (mapInstance) {
        mapInstance.remove();
      }
      mapRef.current = null;
    };
  }, [container]);

  const getMap = () => mapRef.current;

  return {
    isReady,
    error,
    getMap,
  };
};