import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from '../area/hooks/useMapInitialization';
import { calculateRoute, getTrafficIncidents, searchLocation } from '@/services/tomtom';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocationSearch } from '@/components/ui/location-search';
import type { TomTomRoute } from '@/types/tomtom';

interface LogisticsMapProps {
  className?: string;
}

export function LogisticsMap({ className }: LogisticsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const routeRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { isReady, error } = useMapInitialization();
  const { toast } = useToast();
  const [route, setRoute] = useState<TomTomRoute | null>(null);
  const [sourceLocation, setSourceLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isReady || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-95.7129, 37.0902],
      zoom: 3
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3388ff',
          'line-width': 4
        }
      });

      routeRef.current = map.getSource('route') as mapboxgl.GeoJSONSource;
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isReady]);

  const handlePlanRoute = async () => {
    if (!sourceLocation || !destinationLocation) {
      toast({
        title: "Missing Locations",
        description: "Please enter both source and destination locations.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Search for source location coordinates
      const sourceCoords = await searchLocation(sourceLocation);
      if (!sourceCoords) {
        throw new Error('Could not find source location');
      }

      // Search for destination location coordinates
      const destCoords = await searchLocation(destinationLocation);
      if (!destCoords) {
        throw new Error('Could not find destination location');
      }

      // Calculate route between the points
      const routeData = await calculateRoute(
        sourceCoords.lat,
        sourceCoords.lng,
        destCoords.lat,
        destCoords.lng
      );

      if (!routeData || !mapRef.current || !routeRef.current) {
        throw new Error('Failed to calculate route');
      }

      setRoute(routeData);

      // Update route on map
      const coordinates = routeData.legs[0].points.map(point => [
        point.longitude,
        point.latitude
      ]);

      routeRef.current.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      });

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add source and destination markers
      const sourceMarker = new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat([sourceCoords.lng, sourceCoords.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<div class="p-2">${sourceLocation}</div>`))
        .addTo(mapRef.current);
      
      const destMarker = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([destCoords.lng, destCoords.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<div class="p-2">${destinationLocation}</div>`))
        .addTo(mapRef.current);

      markersRef.current = [sourceMarker, destMarker];

      // Fit map to route bounds
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => bounds.extend(coord as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: 50 });

      // Get and display traffic incidents
      const incidents = await getTrafficIncidents(
        (sourceCoords.lat + destCoords.lat) / 2,
        (sourceCoords.lng + destCoords.lng) / 2,
        50000 // 50km radius
      );

      incidents.forEach(incident => {
        const marker = new mapboxgl.Marker({ color: '#f59e0b' })
          .setLngLat([incident.point.lng, incident.point.lat])
          .setPopup(new mapboxgl.Popup().setHTML(
            `<div class="p-2">
              <h3 class="font-medium">${incident.type}</h3>
              <p class="text-sm">${incident.description}</p>
            </div>`
          ))
          .addTo(mapRef.current!);
        markersRef.current.push(marker);
      });

      toast({
        title: "Route Planned",
        description: "Route has been calculated and displayed on the map.",
      });

    } catch (error) {
      console.error('Error planning route:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to plan route",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card 
      title="Logistics Tracking" 
      description="Real-time shipment tracking and route visualization"
      className={className}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Source Location</label>
            <LocationSearch
              value={sourceLocation}
              onChange={setSourceLocation}
              placeholder="Enter source location"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Destination</label>
            <LocationSearch
              value={destinationLocation}
              onChange={setDestinationLocation}
              placeholder="Enter destination"
            />
          </div>
        </div>

        <Button 
          onClick={handlePlanRoute} 
          disabled={isLoading || !sourceLocation || !destinationLocation}
          className="w-full md:w-auto"
        >
          {isLoading ? "Planning Route..." : "Plan Route"}
        </Button>

        {route && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground">Estimated Time</p>
              <p className="text-lg font-semibold">
                {Math.round(route.summary.travelTimeInSeconds / 60)} min
              </p>
            </div>
            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="text-lg font-semibold">
                {(route.summary.lengthInMeters / 1000).toFixed(1)} km
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        <div className="h-[500px] relative rounded-lg overflow-hidden">
          <div ref={mapContainer} className="absolute inset-0" />
        </div>
      </div>
    </Card>
  );
}

