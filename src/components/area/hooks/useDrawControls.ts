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

    const initDraw = () => {
      if (drawRef.current && mapRef.current) {
        try {
          mapRef.current.removeControl(drawRef.current);
          drawRef.current = null;
        } catch (error) {
          console.error('Error removing draw control:', error);
        }
      }

      try {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          },
          styles: [
            {
              'id': 'gl-draw-polygon-fill',
              'type': 'fill',
              'filter': ['all', ['==', '$type', 'Polygon']],
              'paint': {
                'fill-color': '#3388ff',
                'fill-outline-color': '#3388ff',
                'fill-opacity': 0.1
              }
            },
            {
              'id': 'gl-draw-polygon-stroke',
              'type': 'line',
              'filter': ['all', ['==', '$type', 'Polygon']],
              'paint': {
                'line-color': '#3388ff',
                'line-width': 2
              }
            },
            {
              'id': 'gl-draw-polygon-and-line-vertex-active',
              'type': 'circle',
              'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
              'paint': {
                'circle-radius': 6,
                'circle-color': '#fff',
                'circle-stroke-color': '#3388ff',
                'circle-stroke-width': 2
              }
            }
          ]
        });

        if (!mapRef.current || !mountedRef.current) return;

        mapRef.current.addControl(draw, 'top-left');
        drawRef.current = draw;

        const calculateArea = () => {
          if (!mountedRef.current || !draw) return;
          try {
            const data = draw.getAll();
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

        map.on('draw.create', calculateArea);
        map.on('draw.delete', calculateArea);
        map.on('draw.update', calculateArea);

        return () => {
          if (map && mountedRef.current) {
            try {
              map.off('draw.create', calculateArea);
              map.off('draw.delete', calculateArea);
              map.off('draw.update', calculateArea);
              if (drawRef.current) {
                map.removeControl(drawRef.current);
              }
            } catch (error) {
              console.error('Draw controls cleanup error:', error);
            }
            drawRef.current = null;
          }
        };
      } catch (error) {
        console.error('Draw controls initialization error:', error);
      }
    };

    const cleanup = initDraw();
    return () => {
      if (cleanup) cleanup();
    };
  }, [mapRef, mountedRef, onAreaUpdate, selectedUnit]);

  return drawRef;
}