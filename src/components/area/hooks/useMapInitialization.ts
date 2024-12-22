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
    if (!container.current) return;

    let mapInstance: mapboxgl.Map | null = null;

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
      
      mapInstance = new mapboxgl.Map({
        container: container.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      const onLoad = () => {
        if (mapInstance) {
          mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
          mapInstanceRef.current = mapInstance;
          setMapState({ isReady: true, error: null });
        }
      };

      mapInstance.once('load', onLoad);

      return () => {
        if (mapInstance) {
          mapInstance.off('load', onLoad);
          mapInstance.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapState({
        isReady: false,
        error: 'Failed to initialize map. Please try again later.'
      });
    }
  }, [container]);

  return {
    isReady: mapState.isReady,
    error: mapState.error,
    getMap: () => mapInstanceRef.current,
  };
};