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
  const isMounted = useRef(true);

  useEffect(() => {
    if (!container.current || mapInstanceRef.current) return;

    const initializeMap = () => {
      try {
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
        
        const newMap = new mapboxgl.Map({
          container: container.current!,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        const onMapLoad = () => {
          if (!isMounted.current) return;
          
          newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
          mapInstanceRef.current = newMap;
          setMapState({ isReady: true, error: null });
        };

        newMap.once('load', onMapLoad);

        newMap.on('error', (e) => {
          if (!isMounted.current) return;
          console.error('Map error:', e);
          setMapState({
            isReady: false,
            error: 'Failed to initialize map. Please try again later.'
          });
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMounted.current) {
          setMapState({
            isReady: false,
            error: 'Failed to initialize map. Please try again later.'
          });
        }
      }
    };

    // Small delay to ensure container is ready
    const timeoutId = setTimeout(initializeMap, 100);

    return () => {
      clearTimeout(timeoutId);
      isMounted.current = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [container]);

  // Return a function to access the map instead of the map itself
  const getMap = () => mapInstanceRef.current;

  return {
    isReady: mapState.isReady,
    error: mapState.error,
    getMap,
  };
};