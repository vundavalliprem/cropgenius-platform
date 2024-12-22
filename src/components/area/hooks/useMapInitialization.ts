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

  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      if (!container.current) return;

      try {
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';

        if (!mapInstanceRef.current) {
          const map = new mapboxgl.Map({
            container: container.current,
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: [-95.7129, 37.0902],
            zoom: 15,
          });

          await new Promise<void>((resolve) => {
            map.once('load', () => {
              if (mounted) {
                map.addControl(new mapboxgl.NavigationControl(), 'top-right');
                mapInstanceRef.current = map;
                setMapState({ isReady: true, error: null });
              }
              resolve();
            });
          });
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        if (mounted) {
          setMapState({
            isReady: false,
            error: 'Failed to initialize map. Please try again later.'
          });
        }
      }
    };

    initializeMap();

    return () => {
      mounted = false;
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