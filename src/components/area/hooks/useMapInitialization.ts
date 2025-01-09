import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapInitialization = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoidnVuZGF2YWxsaXByZW0iLCJhIjoiY201bzI3M3pjMGdwZDJqczh0dzl0OXVveSJ9.YyEzTyV_TdB8lcKibGn5Yg';
      setIsReady(true);
      setError(null);
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map. Please try again later.');
    }
  }, []);

  return {
    isReady,
    error
  };
};