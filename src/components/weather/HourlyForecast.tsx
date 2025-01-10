import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useWeatherData } from '@/services/stormGlass';

interface HourlyForecastProps {
  lat: number;
  lng: number;
}

export function HourlyForecast({ lat, lng }: HourlyForecastProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });

  // Generate hourly data (mock data for now since the API doesn't provide hourly forecast)
  const data = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    temperature: Math.round((weatherData?.airTemperature?.noaa || 20) + Math.sin(i / 4) * 5),
    humidity: Math.round((weatherData?.humidity?.noaa || 50) + Math.cos(i / 4) * 10),
  }));

  return (
    <Card title="Hourly Forecast" description="24-hour weather prediction">
      <div className="h-[300px] mt-4">
        <ChartContainer
          className="h-full"
          config={{
            temperature: {
              label: 'Temperature (°C)',
              color: '#e11d48',
            },
            humidity: {
              label: 'Humidity (%)',
              color: '#0ea5e9',
            },
          }}
        >
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <ChartTooltip />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#e11d48"
              fill="#e11d48"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </Card>
  );
}