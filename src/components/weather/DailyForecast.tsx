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
      <div className="mt-4 space-y-2 sm:space-y-3">
        {data.map((day, index) => (
          <div 
            key={day.day}
            className={`glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:scale-105 transition-all duration-300 ${
              index === 0 ? 'weather-glow' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-1">
                <span className="font-bold text-sm sm:text-base min-w-[60px] sm:min-w-[80px]">{day.day}</span>
                <div className="flex items-center justify-center">
                  {React.cloneElement(day.icon as React.ReactElement, { 
                    className: "w-6 h-6 sm:w-8 sm:h-8" 
                  })}
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{day.maxTemp}°</span>
                  <span className="text-sm sm:text-base text-muted-foreground">{day.minTemp}°</span>
                </div>
                
                <div className="hidden sm:flex items-center gap-2 md:gap-3 text-xs">
                  <div className="flex items-center gap-1 px-2 py-1 glass-card rounded-lg">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span>{day.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 glass-card rounded-lg">
                    <Wind className="w-3 h-3 text-teal-400" />
                    <span>{day.wind}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 glass-card rounded-lg">
                    <Gauge className="w-3 h-3 text-yellow-400" />
                    <span>{day.uv}</span>
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