import { supabase } from "@/integrations/supabase/client";

export interface HereRoute {
  sections: Array<{
    summary: {
      length: number;
      duration: number;
      trafficDelay?: number;
    };
    polyline: string;
  }>;
  departure: {
    time: string;
  };
  arrival: {
    time: string;
  };
}

async function getHereApiKey(): Promise<string> {
  const { data: { HERE_API_KEY }, error } = await supabase
    .functions.invoke('get-secret', {
      body: { name: 'HERE_API_KEY' }
    });

  if (error || !HERE_API_KEY) {
    console.error('Failed to get HERE API key:', error);
    throw new Error('Failed to get HERE API key');
  }

  return HERE_API_KEY;
}

export async function searchLocation(query: string): Promise<Array<{
  lat: number;
  lng: number;
  address: string;
}>> {
  try {
    const apiKey = await getHereApiKey();
    
    const response = await fetch(
      `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(query)}&apiKey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to search location');
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      lat: item.position.lat,
      lng: item.position.lng,
      address: item.address.label,
    }));
  } catch (error) {
    console.error('Error searching location:', error);
    return [];
  }
}

export async function calculateRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<HereRoute | null> {
  try {
    const apiKey = await getHereApiKey();

    const response = await fetch(
      `https://router.hereapi.com/v8/routes?transportMode=truck&origin=${startLat},${startLng}&destination=${endLat},${endLng}&return=polyline,summary,actions,instructions&apiKey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to calculate route');
    }

    const data = await response.json();
    return data.routes[0];
  } catch (error) {
    console.error('Error calculating route:', error);
    return null;
  }
}

export async function getTrafficIncidents(
  lat: number,
  lng: number,
  radius: number
): Promise<any[]> {
  try {
    const apiKey = await getHereApiKey();

    const response = await fetch(
      `https://traffic.ls.hereapi.com/traffic/6.2/incidents.json?apiKey=${apiKey}&prox=${lat},${lng},${radius}`
    );

    if (!response.ok) {
      throw new Error('Failed to get traffic incidents');
    }

    const data = await response.json();
    return data.TRAFFIC_ITEMS?.TRAFFIC_ITEM || [];
  } catch (error) {
    console.error('Error getting traffic incidents:', error);
    return [];
  }
}