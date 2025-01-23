import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWeatherData } from '@/services/openWeather';
import { Cloud, CloudRain, CloudSun, CloudLightning } from 'lucide-react';

interface DailyForecastProps {
  lat: number;
  lng: number;
}

const getWeatherIcon = (index: number) => {
  const icons = [
    <CloudSun className="w-4 h-4" key="sun" />,
    <Cloud className="w-4 h-4" key="cloud" />,
    <CloudRain className="w-4 h-4" key="rain" />,
    <CloudLightning className="w-4 h-4" key="lightning" />,
  ];
  return icons[index % icons.length];
};

export function DailyForecast({ lat, lng }: DailyForecastProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });

  const data = Array.from({ length: 7 }, (_, i) => {
    const baseTemp = weatherData?.temp || 20;
    return {
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      temperature: Math.round(baseTemp + Math.sin(i / 2) * 3),
      icon: getWeatherIcon(i),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow-lg border">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-sm">Temperature: {payload[0].value}°C</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Daily Forecast" description="7-day weather prediction">
      <div className="h-[300px] mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
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
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#e11d48"
              strokeWidth={2}
              dot={{ stroke: '#e11d48', strokeWidth: 2, fill: '#fff', r: 4 }}
              activeDot={{ r: 6, fill: "#e11d48" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}