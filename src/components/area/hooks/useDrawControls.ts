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

  useEffect(() => {
    if (!mapRef.current || !mountedRef.current) return;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    mapRef.current.addControl(draw);
    drawRef.current = draw;

    const handleUpdate = () => {
      if (!mountedRef.current || !drawRef.current) return;
      try {
        const data = drawRef.current.getAll();
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

    const map = mapRef.current;
    map.on('draw.create', handleUpdate);
    map.on('draw.delete', handleUpdate);
    map.on('draw.update', handleUpdate);

    return () => {
      if (mountedRef.current && mapRef.current && drawRef.current) {
        const map = mapRef.current;
        map.off('draw.create', handleUpdate);
        map.off('draw.delete', handleUpdate);
        map.off('draw.update', handleUpdate);
        map.removeControl(drawRef.current);
      }
      drawRef.current = null;
    };
  }, [mapRef, mountedRef, onAreaUpdate, selectedUnit]);

  return drawRef;
}
