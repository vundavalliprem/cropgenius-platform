import { supabase } from "@/integrations/supabase/client";

export interface HereRoute {
  sections: Array<{
    id: string;
    polyline: string;
    summary: {
      length: number;
      duration: number;
    };
  }>;
}

export interface TrafficIncident {
  TRAFFIC_ITEM_ID: string;
  TRAFFIC_ITEM_TYPE_DESC: string;
  LOCATION: {
    GEOLOC: {
      LATITUDE: number;
      LONGITUDE: number;
    };
  };
  TRAFFIC_ITEM_DESCRIPTION?: Array<{
    value: string;
  }>;
}

async function getHereApiKey(): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { name: 'HERE_API_KEY' }
    });

    if (error || !data?.HERE_API_KEY) {
      console.error('Error getting HERE API key:', error);
      throw new Error('Failed to get HERE API key');
    }

    return data.HERE_API_KEY;
  } catch (error) {
    console.error('Error in getHereApiKey:', error);
    throw error;
  }
}

export async function searchLocation(query: string): Promise<Array<{ lat: number; lng: number; display_name: string }>> {
  if (!query.trim()) return [];

  try {
    const apiKey = await getHereApiKey();
    const url = new URL('https://geocode.search.hereapi.com/v1/geocode');
    url.searchParams.append('q', query);
    url.searchParams.append('apiKey', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Location search failed');
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      lat: item.position.lat,
      lng: item.position.lng,
      display_name: item.title
    }));
  } catch (error) {
    console.error('Error in searchLocation:', error);
    return [];
  }
}

export async function calculateRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<HereRoute> {
  try {
    const apiKey = await getHereApiKey();
    const url = new URL('https://router.hereapi.com/v8/routes');
    url.searchParams.append('transportMode', 'car');
    url.searchParams.append('origin', `${startLat},${startLng}`);
    url.searchParams.append('destination', `${endLat},${endLng}`);
    url.searchParams.append('return', 'polyline,summary');
    url.searchParams.append('apiKey', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Route calculation failed');
    }

    const data = await response.json();
    return {
      sections: data.routes[0].sections
    };
  } catch (error) {
    console.error('Error in calculateRoute:', error);
    throw error;
  }
}

export async function getTrafficIncidents(
  lat: number,
  lng: number,
  radius: number
): Promise<TrafficIncident[]> {
  try {
    const apiKey = await getHereApiKey();
    const url = new URL('https://traffic.ls.hereapi.com/traffic/6.2/incidents.json');
    url.searchParams.append('apiKey', apiKey);
    url.searchParams.append('prox', `${lat},${lng},${radius}`);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch traffic incidents');
    }

    const data = await response.json();
    return data.TRAFFIC_ITEMS?.TRAFFIC_ITEM || [];
  } catch (error) {
    console.error('Error in getTrafficIncidents:', error);
    return [];
  }
}