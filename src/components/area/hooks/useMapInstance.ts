import { useEffect, useRef } from 'react';
import * as tt from '@tomtom-international/web-sdk-maps';
import { supabase } from "@/integrations/supabase/client";

export function useMapInstance(
  mapContainer: React.RefObject<HTMLDivElement>,
  isReady: boolean
) {
  const mapRef = useRef<tt.default.Map | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!isReady || !mapContainer.current || mapRef.current || mountedRef.current) return;

    const initializeMap = async () => {
      try {
        const { data: { value: apiKey }, error } = await supabase.functions.invoke('get-secret', {
          body: { name: 'MAPTILER_API_KEY' }
        });

        if (error || !apiKey) {
          console.error('Failed to get MapTiler API key:', error);
          return;
        }

        // Initialize map with MapTiler satellite style
        mapRef.current = new tt.default.Map({
          container: mapContainer.current,
          style: `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`,
          zoom: 1,
          center: [0, 0],
        });

        // Add navigation controls
        mapRef.current.addControl(new tt.default.NavigationControl());

        mountedRef.current = true;
      } catch (err) {
        console.error('Map initialization error:', err);
      }
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      mountedRef.current = false;
    };
  }, [isReady, mapContainer]);

  return {
    mapRef,
    mountedRef,
  };
}