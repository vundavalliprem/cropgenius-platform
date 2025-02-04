import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useMapInstance(
  mapContainer: React.RefObject<HTMLDivElement>,
  isReady: boolean
) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mountedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isReady || !mapContainer.current || mapRef.current || mountedRef.current) return;

    const initializeMap = async () => {
      try {
        console.log('Fetching Mapbox access token...');
        const { data: { value: accessToken }, error } = await supabase.functions.invoke('get-secret', {
          body: { name: 'MAPBOX_ACCESS_TOKEN' }
        });

        if (error || !accessToken) {
          console.error('Failed to get Mapbox access token:', error);
          toast({
            title: "Error",
            description: "Failed to initialize map. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        console.log('Initializing map with Mapbox satellite style...');
        mapboxgl.accessToken = accessToken;
        
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          zoom: 1,
          center: [0, 0]
        });

        map.addControl(new mapboxgl.NavigationControl());
        mapRef.current = map as any; // Type cast to work with existing draw controls
        mountedRef.current = true;
        
        console.log('Map initialized successfully');
      } catch (err) {
        console.error('Map initialization error:', err);
        toast({
          title: "Error",
          description: "Failed to initialize map. Please try again later.",
          variant: "destructive",
        });
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
  }, [isReady, mapContainer, toast]);

  return {
    mapRef,
    mountedRef,
  };
}