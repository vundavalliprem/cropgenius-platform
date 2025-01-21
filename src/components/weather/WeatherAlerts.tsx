import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CloudRain, Wind, Sun, Thermometer } from "lucide-react";
import { useWeatherData } from '@/services/openWeather';

interface WeatherAlertsProps {
  lat: number;
  lng: number;
}

export function WeatherAlerts({ lat, lng }: WeatherAlertsProps) {
  const { data: weatherData } = useWeatherData({ lat, lng });

  const getAlerts = () => {
    const alerts = [];
    
    if (weatherData) {
      if (weatherData.temp > 30) {
        alerts.push({
          id: 1,
          type: 'warning',
          title: 'High Temperature Alert',
          description: 'Temperature exceeds 30°C. Consider additional irrigation for crops.',
          icon: Thermometer,
        });
      }

      if (weatherData.windSpeed > 10) {
        alerts.push({
          id: 2,
          type: 'warning',
          title: 'Strong Winds',
          description: `Wind speeds of ${weatherData.windSpeed.toFixed(1)} m/s detected. Secure loose equipment and monitor crop stress.`,
          icon: Wind,
        });
      }

      // Add more weather-based alerts as needed
    }

    // Add default alert if no specific conditions are met
    if (alerts.length === 0) {
      alerts.push({
        id: 3,
        type: 'default',
        title: 'Normal Conditions',
        description: 'No severe weather alerts at this time. Continue regular farming operations.',
        icon: Sun,
      });
    }

    return alerts;
  };

  const alerts = getAlerts();

  return (
    <Card title="Weather Alerts" description="AI-powered weather alerts and recommendations">
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Alert key={alert.id} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
            <alert.icon className="h-4 w-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        ))}
      </div>
    </Card>
  );
}