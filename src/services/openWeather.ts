import { useQuery } from "@tanstack/react-query";

const OPENWEATHER_API_KEY = "3293d30edacef7d89d5ee433367d1672";
const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5";

interface WeatherParams {
  lat: number;
  lng: number;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
}

export const useWeatherData = ({ lat, lng }: WeatherParams) => {
  return useQuery({
    queryKey: ['weather', lat, lng],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${OPENWEATHER_API_URL}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        return {
          temp: data.main.temp,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          description: data.weather[0].description,
        } as WeatherData;
      } catch (error) {
        throw error instanceof Error ? error : new Error('An unexpected error occurred');
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};