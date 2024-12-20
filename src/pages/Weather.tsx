import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeatherMap } from "@/components/weather/WeatherMap";
import { WeatherAlerts } from "@/components/weather/WeatherAlerts";
import { SeasonalForecast } from "@/components/weather/SeasonalForecast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Weather() {
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
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Forecast</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            <WeatherMap />
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