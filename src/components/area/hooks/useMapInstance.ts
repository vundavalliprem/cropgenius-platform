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
        const { data: { value: apiKey }, error } = await supabase.functions.invoke('get-secret', {
          body: { name: 'TOMTOM_API_KEY' }
        });

        if (error || !apiKey) {
          console.error('Failed to get TomTom API key:', error);
          toast({
            title: "Error",
            description: "Failed to initialize map. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        console.log('Initializing map with TomTom satellite style...');
        const map = tt.map({
          key: apiKey,
          container: mapContainer.current,
          style: 'tomtom://vector/1/basic-main',
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