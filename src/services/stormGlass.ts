import { useQuery } from "@tanstack/react-query";

const STORMGLASS_API_URL = "https://api.stormglass.io/v2";

interface StormGlassParams {
  lat: number;
  lng: number;
  params?: string[];
  start?: Date;
  end?: Date;
}

interface WeatherPoint {
  airTemperature: { [source: string]: number };
  precipitation: { [source: string]: number };
  windSpeed: { [source: string]: number };
  humidity: { [source: string]: number };
}

export const useWeatherData = ({ lat, lng, params = ['airTemperature', 'precipitation', 'windSpeed', 'humidity'] }: StormGlassParams) => {
  return useQuery({
    queryKey: ['weather', lat, lng],
    queryFn: async () => {
      try {
        const apiKey = localStorage.getItem('STORMGLASS_API_KEY');
        if (!apiKey) {
          throw new Error('Please enter your Storm Glass API key');
        }

        const response = await fetch(
          `${STORMGLASS_API_URL}/weather/point?lat=${lat}&lng=${lng}&params=${params.join(',')}`,
          {
            headers: {
              'Authorization': apiKey,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 402) {
            throw new Error('API quota exceeded. Please try again tomorrow or upgrade your plan.');
          }
          throw new Error(errorData.errors?.key || 'Failed to fetch weather data');
        }

        const data = await response.json();
        return data.hours[0] as WeatherPoint;
      } catch (error) {
        throw error instanceof Error ? error : new Error('An unexpected error occurred');
      }
    },
    enabled: !!localStorage.getItem('STORMGLASS_API_KEY'),
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};