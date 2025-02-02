import { useEffect, useRef } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import { supabase } from "@/integrations/supabase/client";

export function useMapInstance(mapContainer: React.RefObject<HTMLDivElement>, isReady: boolean) {
  const mountedRef = useRef(true);
  const mapRef = useRef<tt.Map | null>(null);
  const navigationControlRef = useRef<tt.NavigationControl | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    const initMap = async () => {
      if (!mapContainer.current || !isReady || !mountedRef.current) return null;

      try {
        // Get the TomTom API key from Supabase secrets
        const { data: { value: apiKey }, error } = await supabase.functions.invoke('get-secret', {
          body: { name: 'TOMTOM_API_KEY' }
        });

        if (error || !apiKey) {
          console.error('Failed to get TomTom API key:', error);
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

        // Create new map instance with the API key
        const map = tt.map({
          key: apiKey,
          container: mapContainer.current,
          style: `https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_main-lite&key=${apiKey}`,
          center: [-95.7129, 37.0902],
          zoom: 15,
          transformRequest: (url: string, resourceType: string) => {
            // Add CORS headers to the request
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
            const navControl = new tt.NavigationControl();
            map.addControl(navControl, 'top-right');
            navigationControlRef.current = navControl;
          } catch (error) {
            console.error('Error adding navigation control:', error);
          }
        });

        // Add error handling for map loading
        map.on('error', (e) => {
          console.error('TomTom map error:', e);
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