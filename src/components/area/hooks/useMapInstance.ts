import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export function useMapInstance(mapContainer: React.RefObject<HTMLDivElement>, isReady: boolean) {
  const mountedRef = useRef(true);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const navigationControlRef = useRef<mapboxgl.NavigationControl | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    const initMap = () => {
      if (!mapContainer.current || !isReady || !mountedRef.current) return null;

      // Cleanup existing map instance
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

      // Create new map instance with a style that includes labels
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        // Using streets-satellite-v12 style which includes terrain and labels
        style: 'mapbox://styles/mapbox/streets-satellite-v12',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      // Add navigation control after map loads
      map.on('load', () => {
        if (!mountedRef.current) return;
        const navControl = new mapboxgl.NavigationControl();
        map.addControl(navControl, 'top-right');
        navigationControlRef.current = navControl;
      });

      mapRef.current = map;
      return map;
    };

    const map = initMap();

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