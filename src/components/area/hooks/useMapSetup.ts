import { useMapInstance } from './useMapInstance';
import { useDrawControls } from './useDrawControls';
import { AreaUnit } from './useAreaCalculation';

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
    mapRef,
    mountedRef,
    onAreaUpdate: setCalculatedArea,
    selectedUnit,
  });

  return {
    mapRef,
    drawRef,
  };
}