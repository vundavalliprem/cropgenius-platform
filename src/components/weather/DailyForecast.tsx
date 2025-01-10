import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useWeatherData } from '@/services/openWeather';

interface DailyForecastProps {
  lat: number;
  lng: number;
}

export function DailyForecast({ lat, lng }: DailyForecastProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });

  // Generate daily data (mock data for now)
  const data = Array.from({ length: 7 }, (_, i) => {
    const baseTemp = weatherData?.temp || 20;
    return {
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      high: Math.round(baseTemp + Math.sin(i / 2) * 3 + 5),
      low: Math.round(baseTemp + Math.sin(i / 2) * 3 - 5),
    };
  });

  return (
    <Card title="Daily Forecast" description="7-day weather prediction">
      <div className="h-[300px] mt-4">
        <ChartContainer
          className="h-full"
          config={{
            high: {
              label: 'High Temperature (°C)',
              color: '#e11d48',
            },
            low: {
              label: 'Low Temperature (°C)',
              color: '#0ea5e9',
            },
          }}
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <ChartTooltip />
            <Bar dataKey="high" fill="#e11d48" />
            <Bar dataKey="low" fill="#0ea5e9" />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}