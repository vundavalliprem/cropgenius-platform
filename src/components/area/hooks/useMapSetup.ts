import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { UNITS, AreaUnit } from './useAreaCalculation';

interface UseMapSetupProps {
  isReady: boolean;
  selectedUnit: AreaUnit;
  setCalculatedArea: (area: number | null) => void;
  mapContainer: React.RefObject<HTMLDivElement>;
}

export function useMapSetup({
  isReady,
  selectedUnit,
  setCalculatedArea,
  mapContainer
}: UseMapSetupProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const calculateArea = useCallback(() => {
    const draw = drawRef.current;
    if (!draw) return;
    
    const data = draw.getAll();
    if (!data?.features.length) {
      setCalculatedArea(null);
      return;
    }
    const area = turf.area(data);
    const multiplier = UNITS[selectedUnit].multiplier;
    setCalculatedArea(Number((area * multiplier).toFixed(2)));
  }, [selectedUnit, setCalculatedArea]);

  useEffect(() => {
    if (!mapContainer.current || !isReady) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-95.7129, 37.0902],
      zoom: 15,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    mapRef.current = map;
    drawRef.current = draw;

    map.addControl(draw);
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('draw.create', calculateArea);
    map.on('draw.delete', calculateArea);
    map.on('draw.update', calculateArea);

    return () => {
      if (mapRef.current) {
        if (drawRef.current) {
          mapRef.current.removeControl(drawRef.current);
        }
        mapRef.current.remove();
        mapRef.current = null;
        drawRef.current = null;
      }
    };
  }, [isReady, calculateArea, mapContainer]);

  return {
    mapRef,
    drawRef,
  };
}