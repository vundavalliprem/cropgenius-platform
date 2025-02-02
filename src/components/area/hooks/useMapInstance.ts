import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";

export function useMapInstance(mapContainer: React.RefObject<HTMLDivElement>, isReady: boolean) {
  const mountedRef = useRef(true);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const navigationControlRef = useRef<mapboxgl.NavigationControl | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    const initMap = async () => {
      if (!mapContainer.current || !isReady || !mountedRef.current) return null;

      try {
        // Get the MapTiler API key from Supabase secrets
        const { data: { value: apiKey }, error } = await supabase.functions.invoke('get-secret', {
          body: { name: 'MAPTILER_API_KEY' }
        });

        if (error || !apiKey) {
          console.error('Failed to get MapTiler API key:', error);
          return null;
        }

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

        // Create new map instance with MapTiler
        mapboxgl.accessToken = 'not-needed';
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`,
          center: [-95.7129, 37.0902],
          zoom: 15,
          transformRequest: (url: string, resourceType: string) => {
            return {
              url: url,
              headers: {
                'Accept': 'application/json',
                'Origin': window.location.origin
              }
            };
          }
        });

        // Add navigation control after map loads
        map.on('load', () => {
          if (!mountedRef.current) return;
          
          try {
            const navControl = new mapboxgl.NavigationControl();
            map.addControl(navControl, 'top-right');
            navigationControlRef.current = navControl;
          } catch (error) {
            console.error('Error adding navigation control:', error);
          }
        });

        // Add error handling for map loading
        map.on('error', (e) => {
          console.error('MapTiler map error:', e);
        });

        mapRef.current = map;
        return map;
      } catch (error) {
        console.error('Error initializing map:', error);
        return null;
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