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
  const initializationTimeout = useRef<number | null>(null);

  useEffect(() => {
    const initializeMap = () => {
      if (!container.current || mapInstanceRef.current) return;

      try {
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
        
        const map = new mapboxgl.Map({
          container: container.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        const onLoad = () => {
          map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          setMapState({ isReady: true, error: null });
        };

        const onError = () => {
          setMapState({
            isReady: false,
            error: 'Failed to initialize map. Please try again later.'
          });
        };

        map.once('load', onLoad);
        map.once('error', onError);

        mapInstanceRef.current = map;
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapState({
          isReady: false,
          error: 'Failed to initialize map. Please try again later.'
        });
      }
    };

    // Ensure DOM is ready before initializing
    initializationTimeout.current = window.setTimeout(initializeMap, 100);

    return () => {
      if (initializationTimeout.current) {
        window.clearTimeout(initializationTimeout.current);
      }
      
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