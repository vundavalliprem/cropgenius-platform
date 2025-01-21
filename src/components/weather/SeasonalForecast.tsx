import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useWeatherData } from '@/services/openWeather';

interface SeasonalForecastProps {
  lat?: number;
  lng?: number;
}

export function SeasonalForecast({ lat = 37.0902, lng = -95.7129 }: SeasonalForecastProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });

  // Generate seasonal data with current temperature as reference
  const data = [
    { 
      month: 'Current', 
      temperature: weatherData?.temp || 20,
      rainfall: 3.5,
    },
    { month: 'Jan', temperature: 32, rainfall: 2.5 },
    { month: 'Feb', temperature: 35, rainfall: 2.8 },
    { month: 'Mar', temperature: 45, rainfall: 3.2 },
    { month: 'Apr', temperature: 55, rainfall: 3.8 },
    { month: 'May', temperature: 65, rainfall: 4.1 },
    { month: 'Jun', temperature: 75, rainfall: 3.9 },
  ];

  return (
    <Card 
      title="Seasonal Forecast" 
      description="6-month prediction of temperature and rainfall patterns to help with crop planning"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-background rounded-lg">
            <h3 className="font-medium mb-2">Temperature Trend</h3>
            <p className="text-sm text-muted-foreground">
              Shows expected temperature changes over the next 6 months, helping you plan crop cycles and frost protection.
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <h3 className="font-medium mb-2">Rainfall Pattern</h3>
            <p className="text-sm text-muted-foreground">
              Indicates predicted rainfall levels, useful for irrigation planning and water management.
            </p>
          </div>
        </div>

        <div className="h-[400px]">
          <ChartContainer
            className="h-full"
            config={{
              temperature: {
                label: 'Temperature (°F)',
                color: '#e11d48',
              },
              rainfall: {
                label: 'Rainfall (inches)',
                color: '#0ea5e9',
              },
            }}
          >
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="temp" orientation="left" label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="rain" orientation="right" label={{ value: 'Rainfall (inches)', angle: 90, position: 'insideRight' }} />
              <ChartTooltip />
              <Legend />
              <Area
                yAxisId="temp"
                type="monotone"
                dataKey="temperature"
                name="Temperature"
                stroke="#e11d48"
                fill="#e11d48"
                fillOpacity={0.2}
              />
              <Area
                yAxisId="rain"
                type="monotone"
                dataKey="rainfall"
                name="Rainfall"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </Card>
  );
}