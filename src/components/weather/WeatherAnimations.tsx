import React from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Zap } from 'lucide-react';

interface WeatherAnimationsProps {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy';
}

export function WeatherAnimations({ condition }: WeatherAnimationsProps) {
  switch (condition) {
    case 'sunny':
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <Sun className="w-32 h-32 text-yellow-400 animate-sun-glow" />
        </div>
      );

    case 'cloudy':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Cloud className="absolute top-10 left-10 w-24 h-24 text-gray-400 animate-float opacity-60" />
          <Cloud className="absolute top-20 right-20 w-32 h-32 text-gray-500 animate-float opacity-50" style={{ animationDelay: '1s' }} />
          <Cloud className="absolute bottom-20 left-1/3 w-28 h-28 text-gray-400 animate-float opacity-40" style={{ animationDelay: '2s' }} />
        </div>
      );

    case 'rainy':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <CloudRain className="absolute top-10 left-1/4 w-24 h-24 text-blue-400 animate-float opacity-70" />
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-8 bg-blue-400 animate-rainfall opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      );

    case 'stormy':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <CloudRain className="absolute top-10 left-1/4 w-24 h-24 text-gray-700 animate-float" />
          <Zap className="absolute top-1/3 left-1/2 w-16 h-16 text-yellow-300 animate-lightning" />
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-8 bg-blue-300 animate-rainfall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
              }}
            />
          ))}
        </div>
      );

    case 'snowy':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <CloudSnow className="absolute top-10 left-1/4 w-24 h-24 text-blue-200 animate-float opacity-80" />
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-snowfall opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      );

    case 'foggy':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 opacity-30 blur-3xl" />
          <Cloud className="absolute top-1/4 left-10 w-32 h-32 text-gray-400 animate-float opacity-40 blur-sm" />
          <Cloud className="absolute top-1/3 right-20 w-40 h-40 text-gray-500 animate-float opacity-30 blur-sm" style={{ animationDelay: '1.5s' }} />
        </div>
      );

    default:
      return null;
  }
}
