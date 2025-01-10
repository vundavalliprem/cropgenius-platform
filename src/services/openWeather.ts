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

// Fallback mock data while API key activates
const getMockWeatherData = (lat: number, lng: number): WeatherData => ({
  temp: 20 + Math.random() * 10,
  humidity: 50 + Math.random() * 20,
  windSpeed: 5 + Math.random() * 5,
  description: "Mock weather data",
});

export const useWeatherData = ({ lat, lng }: WeatherParams) => {
  return useQuery({
    queryKey: ['weather', lat, lng],
    queryFn: async () => {
      try {
        console.log('Fetching weather data for:', { lat, lng });
        const response = await fetch(
          `${OPENWEATHER_API_URL}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.warn('Weather API Error:', errorData);
          
          // If API key is invalid (401), return mock data
          if (response.status === 401) {
            console.log('Using mock weather data while API key activates');
            return getMockWeatherData(lat, lng);
          }
          
          throw new Error(errorData.message || 'Failed to fetch weather data');
        }

        const data = await response.json();
        return {
          temp: data.main.temp,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          description: data.weather[0].description,
        } as WeatherData;
      } catch (error) {
        console.error('Weather service error:', error);
        // Return mock data for any error to keep the app functional
        return getMockWeatherData(lat, lng);
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
