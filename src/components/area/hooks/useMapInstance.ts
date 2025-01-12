import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export function useMapInstance(mapContainer: React.RefObject<HTMLDivElement>, isReady: boolean) {
  const mountedRef = useRef(true);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const navigationControlRef = useRef<mapboxgl.NavigationControl | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !isReady) return;

    const initMap = () => {
      try {
        // Cleanup existing instances
        if (mapRef.current) {
          if (navigationControlRef.current) {
            mapRef.current.removeControl(navigationControlRef.current);
            navigationControlRef.current = null;
          }
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        const navControl = new mapboxgl.NavigationControl();
        map.addControl(navControl, 'top-right');
        
        navigationControlRef.current = navControl;
        mapRef.current = map;

        // Store map instance in ref to avoid serialization issues
        return () => {
          if (map) {
            if (navControl) {
              map.removeControl(navControl);
            }
            map.remove();
          }
        };
      } catch (error) {
        console.error('Map initialization error:', error);
      }
    };

    const cleanup = initMap();

    return () => {
      mountedRef.current = false;
      if (cleanup) cleanup();
    };
  }, [isReady, mapContainer]);

  return { mapRef, mountedRef };
}