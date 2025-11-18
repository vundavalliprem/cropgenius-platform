import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { useWeatherData } from '@/services/openWeather';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface WeatherChartsProps {
  lat: number;
  lng: number;
}

export function WeatherCharts({ lat, lng }: WeatherChartsProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });

  // Generate 24-hour temperature data
  const hourlyTempData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    temp: Math.round((weatherData?.temp || 20) + Math.sin(i / 4) * 5),
  }));

  // Generate 5-day temperature data
  const dailyTempData = Array.from({ length: 5 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i],
    high: Math.round((weatherData?.temp || 20) + 5 + Math.random() * 3),
    low: Math.round((weatherData?.temp || 20) - 3 - Math.random() * 2),
  }));

  // Generate precipitation data
  const precipData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    chance: Math.round(Math.random() * 100),
  }));

  // Generate wind speed data
  const windData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    speed: Math.round((weatherData?.windSpeed || 15) + Math.sin(i / 3) * 5),
  }));

  // Generate UV index data
  const uvData = Array.from({ length: 12 }, (_, i) => ({
    hour: `${i + 6}:00`,
    uv: Math.round(Math.max(0, 5 + Math.sin((i - 3) / 2) * 4)),
  }));

  return (
    <div className="space-y-6">
      {/* Temperature Trend - 24 Hours */}
      <Card title="Temperature Trend (24 Hours)" description="Hourly temperature forecast">
        <div className="mt-4 h-64 glass-card rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyTempData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--weather-glow))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--weather-glow))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--glass-bg) / 0.9)', 
                  border: '1px solid hsl(var(--glass-border) / 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }} 
              />
              <Area type="monotone" dataKey="temp" stroke="hsl(var(--weather-glow))" fillOpacity={1} fill="url(#tempGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 5-Day Temperature */}
      <Card title="5-Day Temperature Forecast" description="Daily high and low temperatures">
        <div className="mt-4 h-64 glass-card rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTempData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--glass-bg) / 0.9)', 
                  border: '1px solid hsl(var(--glass-border) / 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }} 
              />
              <Bar dataKey="high" fill="hsl(var(--weather-glow))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="low" fill="hsl(var(--weather-accent))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Precipitation */}
        <Card title="Precipitation Probability" description="Chance of rain in next 24 hours">
          <div className="mt-4 h-48 glass-card rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={precipData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--glass-bg) / 0.9)', 
                    border: '1px solid hsl(var(--glass-border) / 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
                <Bar dataKey="chance" fill="hsl(200 100% 50%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Wind Speed */}
        <Card title="Wind Speed" description="Wind speed forecast">
          <div className="mt-4 h-48 glass-card rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={windData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--glass-bg) / 0.9)', 
                    border: '1px solid hsl(var(--glass-border) / 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
                <Line type="monotone" dataKey="speed" stroke="hsl(var(--weather-accent))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* UV Index */}
      <Card title="UV Index Timeline" description="UV index throughout the day">
        <div className="mt-4 h-48 glass-card rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={uvData}>
              <defs>
                <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(45 100% 50%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(45 100% 50%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--glass-bg) / 0.9)', 
                  border: '1px solid hsl(var(--glass-border) / 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }} 
              />
              <Area type="monotone" dataKey="uv" stroke="hsl(45 100% 50%)" fillOpacity={1} fill="url(#uvGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
