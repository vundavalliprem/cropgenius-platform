import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { useWeatherData } from '@/services/openWeather';
import { Sunrise, Sunset, Wind, Droplets, Eye, Gauge, Thermometer } from 'lucide-react';
import { AirQuality } from './AirQuality';

interface TodayHighlightsProps {
  lat: number;
  lng: number;
}

export function TodayHighlights({ lat, lng }: TodayHighlightsProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });

  const highlights = [
    {
      icon: <Thermometer className="w-6 h-6" />,
      label: "Feels Like",
      value: `${Math.round(weatherData?.temp || 20)}°C`,
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      label: "Humidity",
      value: `${weatherData?.humidity || 65}%`,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Wind className="w-6 h-6" />,
      label: "Wind Speed",
      value: `${weatherData?.windSpeed || 15} km/h`,
      gradient: "from-teal-500 to-emerald-500"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      label: "Visibility",
      value: "10 km",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Gauge className="w-6 h-6" />,
      label: "UV Index",
      value: "Moderate (5)",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Sunrise className="w-6 h-6" />,
      label: "Sunrise",
      value: "06:24 AM",
      gradient: "from-yellow-400 to-orange-400"
    },
    {
      icon: <Sunset className="w-6 h-6" />,
      label: "Sunset",
      value: "18:45 PM",
      gradient: "from-orange-600 to-red-600"
    },
  ];

  return (
    <Card title="Today's Highlights" description="Key weather metrics for today">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-4">
        {highlights.map((item, index) => (
          <div
            key={item.label}
            className="glass-card rounded-2xl p-4 sm:p-6 hover:scale-105 transition-transform duration-300 weather-glow"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 sm:mb-4 animate-float shadow-lg`}>
              {React.cloneElement(item.icon as React.ReactElement, { 
                className: "w-5 h-5 sm:w-6 sm:h-6 text-white" 
              })}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{item.label}</p>
            <p className="text-lg sm:text-xl font-bold">{item.value}</p>
          </div>
        ))}
        
        <AirQuality lat={lat} lng={lng} />
      </div>
    </Card>
  );
}
