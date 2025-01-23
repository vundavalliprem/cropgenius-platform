import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { useMapInitialization } from '../area/hooks/useMapInitialization';
import { calculateRoute, getTrafficIncidents, TomTomRoute } from '@/services/tomtom';
import { useToast } from "@/components/ui/use-toast";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LogisticsMapProps {
  className?: string;
  source?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
}

export function LogisticsMap({ className, source, destination }: LogisticsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const routeRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { isReady, error } = useMapInitialization();
  const { toast } = useToast();
  const [route, setRoute] = useState<TomTomRoute | null>(null);

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

  useEffect(() => {
    const fetchRouteAndTraffic = async () => {
      if (!source || !destination || !mapRef.current || !routeRef.current) return;

      try {
        const routeData = await calculateRoute(
          source.lat,
          source.lng,
          destination.lat,
          destination.lng
        );

        if (!routeData) {
          toast({
            title: "Route Error",
            description: "Failed to calculate route. Please try again.",
            variant: "destructive",
          });
          return;
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
          .setLngLat([source.lng, source.lat])
          .addTo(mapRef.current);
        
        const destMarker = new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([destination.lng, destination.lat])
          .addTo(mapRef.current);

        markersRef.current = [sourceMarker, destMarker];

        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord as [number, number]));
        mapRef.current.fitBounds(bounds, { padding: 50 });

        // Get and display traffic incidents
        const incidents = await getTrafficIncidents(
          (source.lat + destination.lat) / 2,
          (source.lng + destination.lng) / 2,
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

      } catch (error) {
        console.error('Error updating route:', error);
        toast({
          title: "Error",
          description: "Failed to update route and traffic data.",
          variant: "destructive",
        });
      }
    };

    fetchRouteAndTraffic();
  }, [source, destination, toast]);

  return (
    <Card 
      title="Logistics Tracking" 
      description="Real-time shipment tracking and route visualization"
      className={className}
    >
      <div className="space-y-4">
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