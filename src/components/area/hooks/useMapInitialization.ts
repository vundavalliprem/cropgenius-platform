import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

type MapState = {
  isReady: boolean;
  error: string | null;
};

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const [mapState, setMapState] = useState<MapState>({
    isReady: false,
    error: null
  });
  
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const initializeMap = async () => {
      if (!container.current || mapInstanceRef.current) return;

      try {
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
        
        const map = new mapboxgl.Map({
          container: container.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        const handleLoad = () => {
          if (!mounted.current) return;
          map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          setMapState({ isReady: true, error: null });
        };

        const handleError = () => {
          if (!mounted.current) return;
          setMapState({
            isReady: false,
            error: 'Failed to initialize map. Please try again later.'
          });
        };

        map.once('load', handleLoad);
        map.once('error', handleError);

        mapInstanceRef.current = map;
      } catch (error) {
        if (mounted.current) {
          console.error('Error initializing map:', error);
          setMapState({
            isReady: false,
            error: 'Failed to initialize map. Please try again later.'
          });
        }
      }
    };

    const timeoutId = setTimeout(initializeMap, 100);

    return () => {
      mounted.current = false;
      clearTimeout(timeoutId);
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [container]);

  const getMap = () => mapInstanceRef.current;

  return {
    isReady: mapState.isReady,
    error: mapState.error,
    getMap,
  };
};