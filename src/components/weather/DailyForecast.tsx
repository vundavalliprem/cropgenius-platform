import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { useWeatherData } from '@/services/openWeather';
import { Cloud, CloudRain, CloudSun, Sun, Droplets, Wind, Gauge } from 'lucide-react';

interface DailyForecastProps {
  lat: number;
  lng: number;
}

const getWeatherIcon = (index: number) => {
  const icons = [
    <Sun className="w-8 h-8 text-yellow-400 animate-sun-glow" key="sun" />,
    <CloudSun className="w-8 h-8 text-blue-400 animate-float" key="cloud-sun" />,
    <Cloud className="w-8 h-8 text-gray-400 animate-float" key="cloud" />,
    <CloudRain className="w-8 h-8 text-blue-500 animate-float" key="rain" />,
  ];
  return icons[index % icons.length];
};

export function DailyForecast({ lat, lng }: DailyForecastProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });

  const data = Array.from({ length: 5 }, (_, i) => {
    const baseTemp = weatherData?.temp || 20;
    const minTemp = Math.round(baseTemp - 3 - Math.random() * 2);
    const maxTemp = Math.round(baseTemp + 3 + Math.random() * 2);
    return {
      day: ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri'][i],
      minTemp,
      maxTemp,
      humidity: Math.round(60 + Math.random() * 20),
      wind: Math.round(10 + Math.random() * 15),
      uv: Math.round(3 + Math.random() * 5),
      icon: getWeatherIcon(i),
    };
  });

  return (
    <Card title="5-Day Forecast" description="Extended weather prediction">
      <div className="mt-4 space-y-3">
        {data.map((day, index) => (
          <div 
            key={day.day}
            className={`glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 ${
              index === 0 ? 'weather-glow' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <span className="font-bold text-lg w-24">{day.day}</span>
                <div className="flex items-center justify-center">
                  {day.icon}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-orange-500">{day.maxTemp}°</span>
                  <span className="text-xl text-muted-foreground">{day.minTemp}°</span>
                </div>
                
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span>{day.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-4 h-4 text-teal-400" />
                    <span>{day.wind} km/h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="w-4 h-4 text-yellow-400" />
                    <span>UV {day.uv}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}