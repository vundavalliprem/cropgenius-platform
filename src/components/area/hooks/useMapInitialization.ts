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
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!container.current || mapInstanceRef.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
    
    try {
      const map = new mapboxgl.Map({
        container: container.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      mapInstanceRef.current = map;

      const handleLoad = () => {
        if (!mountedRef.current) return;
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        setMapState({ isReady: true, error: null });
      };

      const handleError = () => {
        if (!mountedRef.current) return;
        setMapState({
          isReady: false,
          error: 'Failed to initialize map. Please try again later.'
        });
      };

      map.once('load', handleLoad);
      map.once('error', handleError);

      return () => {
        mountedRef.current = false;
        if (mapInstanceRef.current) {
          map.off('load', handleLoad);
          map.off('error', handleError);
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapState({
        isReady: false,
        error: 'Failed to initialize map. Please try again later.'
      });
      return () => {
        mountedRef.current = false;
      };
    }
  }, [container]);

  const getMap = () => mapInstanceRef.current;

  return {
    isReady: mapState.isReady,
    error: mapState.error,
    getMap,
  };
};