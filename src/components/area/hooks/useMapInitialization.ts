import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useMapInitialization = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const { data: { value: apiKey }, error } = await supabase.functions.invoke('get-secret', {
          body: { name: 'TOMTOM_API_KEY' }
        });

        if (error || !apiKey) {
          console.error('Failed to get TomTom API key:', error);
          setError('Failed to initialize map. Please check your API key configuration.');
          setIsReady(false);
          return;
        }

        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Failed to initialize map. Please try again later.');
        setIsReady(false);
      }
    };

    initializeMap();
  }, []);

  return {
    isReady,
    error
  };
};