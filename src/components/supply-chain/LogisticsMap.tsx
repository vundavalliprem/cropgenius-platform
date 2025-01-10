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
  const { isReady, error } = useMapInitialization();

  React.useEffect(() => {
    if (!isReady || !mapContainer.current) return;

    // Cleanup any existing instances
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize new map instance
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-95.7129, 37.0902],
      zoom: 3
    });

    const map = mapRef.current;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Return cleanup function
    return () => {
      if (mapRef.current) {
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