import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export function useMapInstance(mapContainer: React.RefObject<HTMLDivElement>, isReady: boolean) {
  const mountedRef = useRef(true);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !isReady) return;

    let mapInstance: mapboxgl.Map | null = null;
    
    try {
      mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-95.7129, 37.0902],
        zoom: 15,
      });

      const navControl = new mapboxgl.NavigationControl();
      mapInstance.addControl(navControl, 'top-right');
      
      mapRef.current = mapInstance;
    } catch (error) {
      console.error('Map initialization error:', error);
      return;
    }

    return () => {
      mountedRef.current = false;
      if (mapInstance) {
        mapInstance.remove();
      }
      mapRef.current = null;
    };
  }, [isReady, mapContainer]);

  return { mapRef, mountedRef };
}