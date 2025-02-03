import { useEffect, useRef } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useMapInstance(
  mapContainer: React.RefObject<HTMLDivElement>,
  isReady: boolean
) {
  const mapRef = useRef<tt.Map | null>(null);
  const mountedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isReady || !mapContainer.current || mapRef.current || mountedRef.current) return;

    const initializeMap = async () => {
      try {
        console.log('Fetching TomTom API key...');
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { name: 'TOMTOM_API_KEY' }
        });

        if (error) {
          console.error('Failed to get TomTom API key:', error);
          toast({
            title: "Error",
            description: "Failed to initialize map. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        if (!data?.value) {
          console.error('TomTom API key not found');
          toast({
            title: "Error",
            description: "Map configuration is missing. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        console.log('Initializing map with TomTom style...');
        const map = tt.map({
          key: data.value,
          container: mapContainer.current,
          style: 'https://api.tomtom.com/style/1/style/22.2.1-9?map=basic_satellite&key=' + data.value,
          zoom: 1,
          center: [0, 0]
        });

        map.addControl(new tt.NavigationControl());
        mapRef.current = map;
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