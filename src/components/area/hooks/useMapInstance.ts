import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export function useMapInstance(mapContainer: React.RefObject<HTMLDivElement>, isReady: boolean) {
  const mountedRef = useRef(true);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const navigationControlRef = useRef<mapboxgl.NavigationControl | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !isReady) return;

    const initMap = () => {
      if (mapRef.current) {
        if (navigationControlRef.current) {
          try {
            mapRef.current.removeControl(navigationControlRef.current);
          } catch (error) {
            console.error('Error removing navigation control:', error);
          }
          navigationControlRef.current = null;
        }
        mapRef.current.remove();
        mapRef.current = null;
      }

      try {
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        map.on('load', () => {
          if (!mountedRef.current) return;
          const navControl = new mapboxgl.NavigationControl();
          map.addControl(navControl, 'top-right');
          navigationControlRef.current = navControl;
        });

        mapRef.current = map;
      } catch (error) {
        console.error('Map initialization error:', error);
      }
    };

    initMap();

    return () => {
      mountedRef.current = false;
      if (mapRef.current) {
        try {
          if (navigationControlRef.current) {
            mapRef.current.removeControl(navigationControlRef.current);
            navigationControlRef.current = null;
          }
          mapRef.current.remove();
        } catch (error) {
          console.error('Map cleanup error:', error);
        }
        mapRef.current = null;
      }
    };
  }, [isReady, mapContainer]);

  return { mapRef, mountedRef };
}