import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWeatherData } from '@/services/openWeather';
import { Cloud, CloudRain, CloudSun, CloudLightning, Moon, Sun } from 'lucide-react';

interface HourlyForecastProps {
  lat: number;
  lng: number;
}

const getWeatherIcon = (hour: number) => {
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow-lg border">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-sm">Temperature: {payload[0].value}°C</p>
          <p className="text-sm">Humidity: {payload[1].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Hourly Forecast" description="24-hour weather prediction">
      <div className="h-[300px] mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <text x={0} y={0} dy={16} textAnchor="middle" fontSize={12}>
                    {payload.value}
                  </text>
                  <g transform="translate(0, -20)">
                    {data[payload.index].icon}
                  </g>
                </g>
              )}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#e11d48"
              fill="#e11d48"
              fillOpacity={0.2}
              activeDot={{ r: 6, fill: "#e11d48" }}
            />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.2}
              activeDot={{ r: 6, fill: "#0ea5e9" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}