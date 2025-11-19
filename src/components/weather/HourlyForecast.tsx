import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { useWeatherData } from '@/services/openWeather';
import { Cloud, CloudRain, CloudSun, Moon, Sun, Droplets, Wind } from 'lucide-react';

interface HourlyForecastProps {
  lat: number;
  lng: number;
}

const getWeatherIcon = (hour: number) => {
  if (hour >= 6 && hour <= 18) {
    if (hour % 4 === 0) return <CloudSun className="w-8 h-8 text-blue-400 animate-float" />;
    if (hour % 3 === 0) return <CloudRain className="w-8 h-8 text-blue-500 animate-float" />;
    if (hour % 2 === 0) return <Cloud className="w-8 h-8 text-gray-400 animate-float" />;
    return <Sun className="w-8 h-8 text-yellow-400 animate-sun-glow" />;
  }
  return <Moon className="w-8 h-8 text-slate-400 animate-float" />;
};

export function HourlyForecast({ lat, lng }: HourlyForecastProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });

  const data = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    temperature: Math.round((weatherData?.temp || 20) + Math.sin(i / 4) * 5),
    rain: Math.round(Math.random() * 100),
    wind: Math.round(10 + Math.random() * 10),
    icon: getWeatherIcon(i),
  }));

  return (
    <Card title="24-Hour Forecast" description="Hourly weather prediction">
      <div className="mt-4">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[hsl(var(--neon-blue))]/30">
          {data.map((hour, index) => (
            <div 
              key={hour.hour}
              className={`glass-card rounded-xl p-3 sm:p-4 min-w-[90px] sm:min-w-[100px] snap-center hover:scale-105 transition-all duration-300 flex-shrink-0 ${
                index === 0 ? 'weather-glow' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold">{hour.hour}</span>
                {React.cloneElement(hour.icon as React.ReactElement, { 
                  className: "w-6 h-6" 
                })}
                <span className="text-lg font-bold">{hour.temperature}°</span>
                
                <div className="flex flex-col gap-1.5 w-full text-xs">
                  <div className="flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className="text-muted-foreground">{hour.rain}%</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Wind className="w-3 h-3 text-teal-400" />
                    <span className="text-muted-foreground">{hour.wind}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}