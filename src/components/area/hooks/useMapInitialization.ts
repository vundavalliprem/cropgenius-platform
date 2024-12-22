import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = (container: React.RefObject<HTMLDivElement>) => {
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!container.current || mapInstance.current) return;

    const initializeMap = async () => {
      try {
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHJwOWhtYmkwMjF1MmpwZnlicnV0ZWF2In0.JprOE7wastMHDgE9Jx7vfQ';
        
        const newMap = new mapboxgl.Map({
          container: container.current!,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-95.7129, 37.0902],
          zoom: 15,
        });

        // Use a separate function to handle map load to prevent closure issues
        const handleMapLoad = () => {
          if (isMounted.current) {
            newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
            mapInstance.current = newMap;
            setIsMapReady(true);
          }
        };

        // Use once instead of on to prevent memory leaks
        newMap.once('load', handleMapLoad);
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMounted.current) {
          setMapError('Failed to initialize map. Please try again later.');
        }
      }
    };

    // Use setTimeout to ensure proper initialization timing
    const timeoutId = setTimeout(initializeMap, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      isMounted.current = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      setIsMapReady(false);
    };
  }, [container]);

  // Return a new object reference each time to prevent serialization issues
  return {
    map: mapInstance,
    mapError,
    isMapReady,
  };
};