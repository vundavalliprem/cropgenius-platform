import { useMapInstance } from './useMapInstance';
import { useDrawControls } from './useDrawControls';
import { AreaUnit } from './useAreaCalculation';
import tt from '@tomtom-international/web-sdk-maps';

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
  const { mapRef, mountedRef } = useMapInstance(mapContainer, isReady);
  const drawRef = useDrawControls({
    mapRef: mapRef as React.RefObject<tt.Map>,
    mountedRef,
    onAreaUpdate: setCalculatedArea,
    selectedUnit,
  });

  return {
    mapRef: mapRef as React.RefObject<tt.Map>,
    drawRef,
  };
}