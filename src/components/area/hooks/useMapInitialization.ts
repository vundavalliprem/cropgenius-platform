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
  
  // Keep map instance in ref but don't expose it directly
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!container.current || mapInstanceRef.current) return;

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
      
      const newMap = new mapboxgl.Map({
        container: container.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      newMap.once('load', () => {
        if (isMounted.current) {
          newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
          mapInstanceRef.current = newMap;
          setMapState({ isReady: true, error: null });
        }
      });

      // Handle potential map load errors
      newMap.on('error', (e) => {
        if (isMounted.current) {
          console.error('Map error:', e);
          setMapState({
            isReady: false,
            error: 'Failed to initialize map. Please try again later.'
          });
        }
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

    return () => {
      isMounted.current = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [container]);

  // Instead of returning the map instance directly, provide methods to interact with it
  const getMap = () => mapInstanceRef.current;

  return {
    isReady: mapState.isReady,
    error: mapState.error,
    getMap, // Return a function to access the map instead of the map itself
  };
};
