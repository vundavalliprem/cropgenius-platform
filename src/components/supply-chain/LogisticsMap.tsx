import React, { useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from '../area/hooks/useMapInitialization';

interface LogisticsMapProps {
  className?: string;
}

export function LogisticsMap({ className }: LogisticsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { isReady, error } = useMapInitialization(mapContainer);

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