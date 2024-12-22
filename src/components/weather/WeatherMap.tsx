import React, { useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from '../area/hooks/useMapInitialization';

interface WeatherMapProps {
  className?: string;
}

export function WeatherMap({ className }: WeatherMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { isReady, error, getMap } = useMapInitialization(mapContainer);

  return (
    <Card title="Weather Map" description="Real-time weather conditions visualization" className={className}>
      <div className="h-[500px] relative rounded-lg overflow-hidden">
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