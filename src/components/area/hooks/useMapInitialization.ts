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
    let map: mapboxgl.Map | null = null;

    const initMap = async () => {
      if (!container.current) return;

      try {
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
        
        map = new mapboxgl.Map({
          container: container.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        map.once('load', () => {
          if (!mounted) return;
          
          map?.addControl(new mapboxgl.NavigationControl(), 'top-right');
          mapInstanceRef.current = map;
          setMapState({ isReady: true, error: null });
        });

      } catch (error) {
        if (!mounted) return;
        console.error('Error initializing map:', error);
        setMapState({
          isReady: false,
          error: 'Failed to initialize map. Please try again later.'
        });
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (map) {
        map.remove();
        map = null;
      }
      mapInstanceRef.current = null;
    };
  }, [container]);

  const getMap = () => mapInstanceRef.current;

  return {
    isReady: mapState.isReady,
    error: mapState.error,
    getMap,
  };
};