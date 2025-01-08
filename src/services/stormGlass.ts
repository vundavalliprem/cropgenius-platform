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
      const response = await fetch(
        `${STORMGLASS_API_URL}/weather/point?lat=${lat}&lng=${lng}&params=${params.join(',')}`,
        {
          headers: {
            'Authorization': localStorage.getItem('STORMGLASS_API_KEY') || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      return data.hours[0] as WeatherPoint;
    },
    enabled: !!localStorage.getItem('STORMGLASS_API_KEY'),
  });
};