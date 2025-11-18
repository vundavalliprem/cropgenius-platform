import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeatherMap } from "@/components/weather/WeatherMap";
import { WeatherAlerts } from "@/components/weather/WeatherAlerts";
import { SeasonalForecast } from "@/components/weather/SeasonalForecast";
import { HourlyForecast } from "@/components/weather/HourlyForecast";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { TodayHighlights } from "@/components/weather/TodayHighlights";
import { WeatherCharts } from "@/components/weather/WeatherCharts";
import { FavoriteCities } from "@/components/weather/FavoriteCities";
import { WeatherAnimations } from "@/components/weather/WeatherAnimations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function Weather() {
  const [currentLocation, setCurrentLocation] = React.useState({ lat: 37.0902, lng: -95.7129 });
  const [weatherCondition, setWeatherCondition] = React.useState<'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy'>('sunny');

  const handleLocationChange = (lat: number, lng: number) => {
    setCurrentLocation({ lat, lng });
  };

  const handleCitySelect = (lat: number, lng: number, cityName: string) => {
    setCurrentLocation({ lat, lng });
  };

  return (
    <DashboardLayout>
      <div className="relative min-h-screen">
        {/* Weather Animations Background */}
        <WeatherAnimations condition={weatherCondition} />
        
        <div className="relative z-10 space-y-8">
          <div className="glass-card rounded-3xl p-8 weather-glow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Weather Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  Real-time weather monitoring with AI-powered insights
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="glass-card"
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition((position) => {
                      setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                      });
                    });
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  My Location
                </Button>
              </div>
            </div>
          </div>

          {/* Favorite Cities */}
          <Card title="Favorite Cities" description="Quick access to saved locations">
            <div className="mt-4">
              <FavoriteCities onCitySelect={handleCitySelect} />
            </div>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="glass-card">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
              <TabsTrigger value="daily">5-Day</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <TodayHighlights {...currentLocation} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HourlyForecast {...currentLocation} />
                <DailyForecast {...currentLocation} />
              </div>
            </TabsContent>
            
            <TabsContent value="hourly" className="space-y-6">
              <HourlyForecast {...currentLocation} />
            </TabsContent>
            
            <TabsContent value="daily" className="space-y-6">
              <DailyForecast {...currentLocation} />
            </TabsContent>
            
            <TabsContent value="charts" className="space-y-6">
              <WeatherCharts {...currentLocation} />
            </TabsContent>
            
            <TabsContent value="map" className="space-y-6">
              <WeatherMap onLocationChange={handleLocationChange} />
            </TabsContent>
            
            <TabsContent value="alerts" className="space-y-6">
              <WeatherAlerts {...currentLocation} />
              <SeasonalForecast {...currentLocation} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}