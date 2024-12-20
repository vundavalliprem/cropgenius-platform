import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CloudRain, Wind, Sun } from "lucide-react";

export function WeatherAlerts() {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Heavy Rain Expected',
      description: 'Consider postponing outdoor activities. Expected rainfall: 2-3 inches.',
      icon: CloudRain,
    },
    {
      id: 2,
      type: 'info',
      title: 'Strong Winds',
      description: 'Wind speeds of 15-20 mph expected. Secure loose equipment.',
      icon: Wind,
    },
    {
      id: 3,
      type: 'warning',
      title: 'High UV Index',
      description: 'UV index will be high between 10 AM and 4 PM. Take necessary precautions.',
      icon: Sun,
    },
  ];

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