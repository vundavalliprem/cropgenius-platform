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

    // Set access token first
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';

    try {
      // Only create new map if none exists
      if (!mapInstanceRef.current) {
        const map = new mapboxgl.Map({
          container: container.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        // Use once instead of on to prevent memory leaks
        map.once('load', () => {
          if (map) {
            map.addControl(new mapboxgl.NavigationControl(), 'top-right');
            // Update state with serializable values only
            setMapState({ isReady: true, error: null });
          }
        });

        mapInstanceRef.current = map;
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      // Ensure error message is serializable
      setMapState({
        isReady: false,
        error: 'Failed to initialize map. Please try again later.'
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [container]); // Only depend on container ref

  // Return a simple getter that returns a serializable value or null
  const getMap = () => mapInstanceRef.current;

  // Return only serializable values
  return {
    isReady: mapState.isReady,
    error: mapState.error,
    getMap,
  };
};