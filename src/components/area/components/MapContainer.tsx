import React from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';

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