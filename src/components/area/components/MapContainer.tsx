import React from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapContainerProps {
  mapError: string | null;
  mapRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

export function MapContainer({ mapError, mapRef, className }: MapContainerProps) {
  return (
    <div className={`h-[600px] relative rounded-lg overflow-hidden shadow-lg ${className}`}>
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500">
          {mapError}
        </div>
      ) : (
        <div ref={mapRef} className="absolute inset-0" />
      )}
    </div>
  );
}