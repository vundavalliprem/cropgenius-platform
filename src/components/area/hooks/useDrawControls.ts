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

    const calculateArea = () => {
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

        // Add line measurements
        data.features.forEach(feature => {
          if (feature.geometry.type === 'Polygon') {
            const coordinates = feature.geometry.coordinates[0];
            for (let i = 0; i < coordinates.length - 1; i++) {
              const start = coordinates[i];
              const end = coordinates[i + 1];
              const line = turf.lineString([start, end]);
              const length = turf.length(line, { units: 'kilometers' });
              
              // Add a marker at the midpoint of each line
              const midpoint = turf.midpoint(
                turf.point(start as [number, number]),
                turf.point(end as [number, number])
              );

              const displayLength = length >= 1 
                ? `${length.toFixed(2)} km`
                : `${(length * 1000).toFixed(0)} m`;

              new mapboxgl.Marker({
                element: createLengthLabel(displayLength),
                anchor: 'center'
              })
                .setLngLat(midpoint.geometry.coordinates as [number, number])
                .addTo(mapRef.current!);
            }
          }
        });
      } catch (error) {
        console.error('Error calculating area:', error);
        onAreaUpdate(null);
      }
    };

    const createLengthLabel = (text: string) => {
      const el = document.createElement('div');
      el.className = 'px-3 py-1.5 rounded-full shadow-lg text-xs font-semibold backdrop-blur-xl border animate-draw-point';
      el.style.cssText = `
        background: hsl(var(--glass-white) / 0.1);
        border-color: hsl(var(--neon-cyan) / 0.3);
        color: hsl(var(--foreground));
        box-shadow: 0 0 20px hsl(var(--neon-cyan) / 0.3);
      `;
      el.textContent = text;
      return el;
    };

    // Initialize draw control with modern neon styles
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
            'fill-color': 'hsl(217, 91%, 60%)',
            'fill-outline-color': 'hsl(189, 94%, 43%)',
            'fill-opacity': 0.15
          }
        },
        {
          'id': 'gl-draw-polygon-stroke',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'Polygon']],
          'paint': {
            'line-color': 'hsl(189, 94%, 43%)',
            'line-width': 3,
            'line-opacity': 0.8
          }
        },
        {
          'id': 'gl-draw-line',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString']],
          'paint': {
            'line-color': 'hsl(280, 100%, 70%)',
            'line-width': 3,
            'line-opacity': 0.6
          }
        },
        {
          'id': 'gl-draw-polygon-and-line-vertex-active',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
          'paint': {
            'circle-radius': 5,
            'circle-color': '#ffffff',
            'circle-stroke-color': 'hsl(280, 100%, 70%)',
            'circle-stroke-width': 2
          }
        },
        {
          'id': 'gl-draw-polygon-and-line-vertex-inactive',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'active', 'true']],
          'paint': {
            'circle-radius': 4,
            'circle-color': '#ffffff',
            'circle-stroke-color': 'hsl(217, 91%, 60%)',
            'circle-stroke-width': 1.5
          }
        }
      ]
    });

    // Add draw control to map
    mapRef.current.addControl(draw, 'top-left');
    drawRef.current = draw;

    // Add event listeners
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
  }, [mapRef, mountedRef, onAreaUpdate, selectedUnit]);

  return drawRef;
}