import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from '../area/hooks/useMapInitialization';
import mapboxgl from 'mapbox-gl';

interface LogisticsMapProps {
  className?: string;
}

export function LogisticsMap({ className }: LogisticsMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const navigationControlRef = React.useRef<mapboxgl.NavigationControl | null>(null);
  const { isReady, error } = useMapInitialization();

  React.useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!isReady || !mapContainer.current || !isMounted) return;

      // Cleanup existing instances
      if (mapRef.current) {
        if (navigationControlRef.current) {
          mapRef.current.removeControl(navigationControlRef.current);
          navigationControlRef.current = null;
        }
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Initialize new map
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-95.7129, 37.0902],
        zoom: 3
      });

      if (!isMounted) {
        map.remove();
        return;
      }

      mapRef.current = map;

      // Add navigation control
      const navControl = new mapboxgl.NavigationControl();
      navigationControlRef.current = navControl;
      map.addControl(navControl, 'top-right');

      return () => {
        if (map) {
          if (navControl) {
            map.removeControl(navControl);
          }
          map.remove();
        }
      };
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        if (navigationControlRef.current) {
          mapRef.current.removeControl(navigationControlRef.current);
          navigationControlRef.current = null;
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isReady]);

  return (
    <Card title="Logistics Tracking" description="Real-time shipment tracking and route visualization" className={className}>
      <div className="h-[400px] relative rounded-lg overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500">
            {error}
          </div>
        ) : (
          <div ref={mapContainer} className="absolute inset-0" />
        )}
      </div>
    </Card>
  );
}