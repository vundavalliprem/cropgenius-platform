import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export function useMapInstance(mapContainer: React.RefObject<HTMLDivElement>, isReady: boolean) {
  const mountedRef = useRef(true);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const navigationControlRef = useRef<mapboxgl.NavigationControl | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !isReady) return;

    try {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      const navControl = new mapboxgl.NavigationControl();
      mapInstance.addControl(navControl, 'top-right');
      
      navigationControlRef.current = navControl;
      mapRef.current = mapInstance;

      return () => {
        mountedRef.current = false;
        if (mapRef.current && navigationControlRef.current) {
          mapRef.current.removeControl(navigationControlRef.current);
          navigationControlRef.current = null;
        }
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (error) {
      console.error('Map initialization error:', error);
      return;
    }
  }, [isReady, mapContainer]);

  return { mapRef, mountedRef };
}