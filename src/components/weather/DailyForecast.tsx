import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { useWeatherData } from '@/services/openWeather';
import { Cloud, CloudRain, CloudSun, Sun } from 'lucide-react';

interface DailyForecastProps {
  lat: number;
  lng: number;
}

const getWeatherIcon = (index: number) => {
  const icons = [
    <Sun className="w-6 h-6 text-yellow-400" key="sun" />,
    <CloudSun className="w-6 h-6 text-primary" key="cloud-sun" />,
    <Cloud className="w-6 h-6 text-primary" key="cloud" />,
    <CloudRain className="w-6 h-6 text-primary" key="rain" />,
  ];
  return icons[index % icons.length];
};

export function DailyForecast({ lat, lng }: DailyForecastProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });

  const data = Array.from({ length: 7 }, (_, i) => {
    const baseTemp = weatherData?.temp || 20;
    const minTemp = Math.round(baseTemp - 3 - Math.random() * 2);
    const maxTemp = Math.round(baseTemp + 3 + Math.random() * 2);
    return {
      day: ['Today', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'][i],
      minTemp,
      maxTemp,
      icon: getWeatherIcon(i),
    };
  });

  return (
    <Card title="7-Day Forecast" description="Weekly weather prediction">
      <div className="mt-4 space-y-4">
        {data.map((day, index) => (
          <div 
            key={day.day}
            className={`flex items-center justify-between p-4 rounded-xl ${
              index === 0 ? 'bg-primary text-white' : 'bg-accent hover:bg-primary/10'
            }`}
          >
            <span className="font-medium w-20">{day.day}</span>
            <div className="flex-1 flex items-center justify-center">
              {day.icon}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{day.maxTemp}°</span>
              <span className="text-muted-foreground">{day.minTemp}°</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}