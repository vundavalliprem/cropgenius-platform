import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { Wind } from 'lucide-react';
import { useWeatherData } from '@/services/openWeather';

interface AirQualityProps {
  lat: number;
  lng: number;
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return 'from-green-500 to-emerald-500';
  if (aqi <= 100) return 'from-yellow-500 to-orange-500';
  if (aqi <= 150) return 'from-orange-500 to-red-500';
  if (aqi <= 200) return 'from-red-500 to-purple-500';
  return 'from-purple-500 to-pink-500';
};

const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  return 'Very Unhealthy';
};

export function AirQuality({ lat, lng }: AirQualityProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });
  
  // Simulated AQI data (in production, fetch from air quality API)
  const aqi = Math.round(50 + Math.random() * 100);
  const pm25 = Math.round(10 + Math.random() * 30);
  const pm10 = Math.round(20 + Math.random() * 40);
  const o3 = Math.round(30 + Math.random() * 50);

  return (
    <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300 weather-glow">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAQIColor(aqi)} flex items-center justify-center animate-float`}>
          <Wind className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Air Quality Index</p>
          <p className="text-2xl font-bold">{aqi}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getAQIColor(aqi)} bg-opacity-20`}>
          <p className="text-sm font-semibold text-center">{getAQICategory(aqi)}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 glass-card rounded-lg">
            <p className="text-muted-foreground mb-1">PM2.5</p>
            <p className="font-bold">{pm25}</p>
          </div>
          <div className="text-center p-2 glass-card rounded-lg">
            <p className="text-muted-foreground mb-1">PM10</p>
            <p className="font-bold">{pm10}</p>
          </div>
          <div className="text-center p-2 glass-card rounded-lg">
            <p className="text-muted-foreground mb-1">O₃</p>
            <p className="font-bold">{o3}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
