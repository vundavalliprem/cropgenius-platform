import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { AreaUnit, UNITS } from './useAreaCalculation';

interface UseDrawControlsProps {
  mapRef: React.RefObject<mapboxgl.Map>;
  mountedRef: React.RefObject<boolean>;
  onAreaUpdate: (area: number | null) => void;
  selectedUnit: AreaUnit;
}

export function useDrawControls({ mapRef, mountedRef, onAreaUpdate, selectedUnit }: UseDrawControlsProps) {
  const drawRef = useRef<MapboxDraw | null>(null);
  const eventHandlersRef = useRef<{
    create: () => void;
    delete: () => void;
    update: () => void;
  } | null>(null);

  useEffect(() => {
    if (!mapRef.current || !mountedRef.current) return;

    try {
      const drawInstance = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        }
      });

      mapRef.current.addControl(drawInstance);
      drawRef.current = drawInstance;

      const calculateArea = () => {
        if (!mountedRef.current || !drawInstance) return;
        try {
          const data = drawInstance.getAll();
          if (!data?.features.length) {
            onAreaUpdate(null);
            return;
          }
          const area = turf.area(data);
          const multiplier = UNITS[selectedUnit].multiplier;
          onAreaUpdate(Number((area * multiplier).toFixed(2)));
        } catch (error) {
          console.error('Error calculating area:', error);
          onAreaUpdate(null);
        }
      };

      const handlers = {
        create: calculateArea,
        delete: calculateArea,
        update: calculateArea
      };

      eventHandlersRef.current = handlers;
      const map = mapRef.current;

      map.on('draw.create', handlers.create);
      map.on('draw.delete', handlers.delete);
      map.on('draw.update', handlers.update);

      return () => {
        if (mountedRef.current && mapRef.current && drawRef.current && eventHandlersRef.current) {
          const map = mapRef.current;
          const handlers = eventHandlersRef.current;
          
          map.off('draw.create', handlers.create);
          map.off('draw.delete', handlers.delete);
          map.off('draw.update', handlers.update);
          
          map.removeControl(drawRef.current);
        }
        drawRef.current = null;
        eventHandlersRef.current = null;
      };
    } catch (error) {
      console.error('Draw controls initialization error:', error);
      return;
    }
  }, [mapRef, mountedRef, onAreaUpdate, selectedUnit]);

  return drawRef;
}