import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export function SeasonalForecast() {
  const data = [
    { month: 'Jan', temperature: 32, rainfall: 2.5 },
    { month: 'Feb', temperature: 35, rainfall: 2.8 },
    { month: 'Mar', temperature: 45, rainfall: 3.2 },
    { month: 'Apr', temperature: 55, rainfall: 3.8 },
    { month: 'May', temperature: 65, rainfall: 4.1 },
    { month: 'Jun', temperature: 75, rainfall: 3.9 },
  ];

  return (
    <Card title="Seasonal Forecast" description="Long-term weather predictions and farming insights">
      <div className="h-[400px] mt-4">
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
            <YAxis yAxisId="temp" orientation="left" />
            <YAxis yAxisId="rain" orientation="right" />
            <ChartTooltip />
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="#e11d48"
              fill="#e11d48"
              fillOpacity={0.2}
            />
            <Area
              yAxisId="rain"
              type="monotone"
              dataKey="rainfall"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </Card>
  );
}