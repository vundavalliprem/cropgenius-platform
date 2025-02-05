import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { useWeatherData } from '@/services/openWeather';
import { Cloud, CloudRain, CloudSun, Moon, Sun } from 'lucide-react';

interface HourlyForecastProps {
  lat: number;
  lng: number;
}

const getWeatherIcon = (hour: number) => {
  if (hour >= 6 && hour <= 18) {
    if (hour % 4 === 0) return <CloudSun className="w-6 h-6 text-primary" />;
    if (hour % 3 === 0) return <CloudRain className="w-6 h-6 text-primary" />;
    if (hour % 2 === 0) return <Cloud className="w-6 h-6 text-primary" />;
    return <Sun className="w-6 h-6 text-yellow-400" />;
  }
  return <Moon className="w-6 h-6 text-slate-400" />;
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
      <div className="mt-4 space-y-6">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent">
          {data.slice(0, 12).map((hour, index) => (
            <div 
              key={hour.hour}
              className={`flex flex-col items-center p-4 min-w-[100px] rounded-xl ${
                index === 0 ? 'bg-primary text-white' : 'bg-accent hover:bg-primary/10'
              }`}
            >
              <span className="text-sm font-medium mb-2">{hour.hour}</span>
              {hour.icon}
              <span className="text-lg font-bold mt-2">{hour.temperature}°</span>
              <span className="text-sm text-muted-foreground mt-1">
                {hour.humidity}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}