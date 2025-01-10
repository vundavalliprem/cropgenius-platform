import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeatherMap } from "@/components/weather/WeatherMap";
import { WeatherAlerts } from "@/components/weather/WeatherAlerts";
import { SeasonalForecast } from "@/components/weather/SeasonalForecast";
import { HourlyForecast } from "@/components/weather/HourlyForecast";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Weather() {
  const defaultLocation = { lat: 37.0902, lng: -95.7129 };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Weather Forecast</h2>
          <p className="text-muted-foreground">
            Monitor weather conditions and get AI-powered recommendations for your farming activities.
          </p>
        </div>

        <Tabs defaultValue="current" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Current Weather</TabsTrigger>
            <TabsTrigger value="hourly">Hourly Forecast</TabsTrigger>
            <TabsTrigger value="daily">Daily Forecast</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Forecast</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            <WeatherMap />
          </TabsContent>
          
          <TabsContent value="hourly" className="space-y-4">
            <HourlyForecast {...defaultLocation} />
          </TabsContent>
          
          <TabsContent value="daily" className="space-y-4">
            <DailyForecast {...defaultLocation} />
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-4">
            <WeatherAlerts />
          </TabsContent>
          
          <TabsContent value="seasonal" className="space-y-4">
            <SeasonalForecast />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}