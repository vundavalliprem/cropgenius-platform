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

      // Create new map instance with modern outdoors style
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-95.7129, 37.0902],
        zoom: 15,
        pitch: 0,
        bearing: 0,
        antialias: true,
      });

      // Add navigation control with smooth animations
      map.on('load', () => {
        if (!mountedRef.current) return;
        
        // Add smooth transitions
        map.setPaintProperty('water', 'fill-color', 'hsl(217, 91%, 60%)');
        
        const navControl = new mapboxgl.NavigationControl({
          visualizePitch: true,
          showCompass: true,
          showZoom: true,
        });
        map.addControl(navControl, 'top-right');
        navigationControlRef.current = navControl;
        
        // Enable smooth map movements
        map.easeTo({ 
          duration: 1000,
          essential: true 
        });
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