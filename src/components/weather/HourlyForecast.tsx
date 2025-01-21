import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useWeatherData } from '@/services/openWeather';
import { Cloud, CloudRain, CloudSun, CloudLightning, Moon, Sun } from 'lucide-react';

interface HourlyForecastProps {
  lat: number;
  lng: number;
}

const getWeatherIcon = (hour: number) => {
  // Simple logic to determine weather icon based on hour
  if (hour >= 6 && hour <= 18) {
    if (hour % 4 === 0) return <CloudSun className="w-4 h-4" />;
    if (hour % 3 === 0) return <CloudRain className="w-4 h-4" />;
    if (hour % 2 === 0) return <Cloud className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  }
  return <Moon className="w-4 h-4" />;
};

export function HourlyForecast({ lat, lng }: HourlyForecastProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });

  const data = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    temperature: Math.round((weatherData?.temp || 20) + Math.sin(i / 4) * 5),
    humidity: Math.round((weatherData?.humidity || 50) + Math.cos(i / 4) * 10),
    icon: getWeatherIcon(i),
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
            <XAxis 
              dataKey="hour" 
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <text x={0} y={0} dy={16} textAnchor="middle">
                    {payload.value}
                  </text>
                  <g transform="translate(0, -20)">
                    {data[payload.index].icon}
                  </g>
                </g>
              )}
            />
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