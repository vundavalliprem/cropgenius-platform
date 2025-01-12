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

    let drawInstance: MapboxDraw | null = null;
    
    try {
      drawInstance = new MapboxDraw({
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

      // Store event handlers in ref to ensure proper cleanup
      eventHandlersRef.current = {
        create: calculateArea,
        delete: calculateArea,
        update: calculateArea
      };

      const map = mapRef.current;
      map.on('draw.create', eventHandlersRef.current.create);
      map.on('draw.delete', eventHandlersRef.current.delete);
      map.on('draw.update', eventHandlersRef.current.update);

      return () => {
        if (mountedRef.current && mapRef.current && drawInstance && eventHandlersRef.current) {
          const map = mapRef.current;
          map.off('draw.create', eventHandlersRef.current.create);
          map.off('draw.delete', eventHandlersRef.current.delete);
          map.off('draw.update', eventHandlersRef.current.update);
          map.removeControl(drawInstance);
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