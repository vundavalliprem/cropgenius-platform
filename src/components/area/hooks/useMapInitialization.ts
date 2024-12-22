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
    mountedRef.current = true;
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';

    if (!container.current || mapInstanceRef.current) return;

    try {
      const mapInstance = new mapboxgl.Map({
        container: container.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      mapInstanceRef.current = mapInstance;

      mapInstance.once('load', () => {
        if (!mountedRef.current) return;
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        setMapState({ isReady: true, error: null });
      });

      mapInstance.once('error', () => {
        if (!mountedRef.current) return;
        setMapState({
          isReady: false,
          error: 'Failed to initialize map. Please try again later.'
        });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      if (mountedRef.current) {
        setMapState({
          isReady: false,
          error: 'Failed to initialize map. Please try again later.'
        });
      }
    }

    return () => {
      mountedRef.current = false;
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