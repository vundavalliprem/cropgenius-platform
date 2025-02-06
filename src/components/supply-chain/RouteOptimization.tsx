
import { Card } from "@/components/ui/dashboard/Card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const routes = [
  {
    id: 1,
    from: "Farm Location A",
    to: "Central Market",
    efficiency: 92,
    savings: 1200,
    status: "In Transit",
    alerts: ["Heavy traffic on highway"],
    eta: "2 hours",
  },
  {
    id: 2,
    from: "Farm Location B",
    to: "Wholesale Market",
    efficiency: 88,
    savings: 800,
    status: "Scheduled",
    alerts: ["Weather alert: Rain expected"],
    eta: "4 hours",
  },
  {
    id: 3,
    from: "Farm Location C",
    to: "Distribution Center",
    efficiency: 95,
    savings: 1500,
    status: "Completed",
    alerts: [],
    eta: "Delivered",
  },
];

export function RouteOptimization() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const handlePlanRoute = () => {
    if (!source || !destination) {
      toast({
        title: "Error",
        description: "Please enter both source and destination locations.",
        variant: "destructive",
      });
      return;
    }

    // Add the new route to the beginning of the routes array
    const newRoute = {
      id: Date.now(),
      from: source,
      to: destination,
      efficiency: 90,
      savings: 1000,
      status: "Scheduled",
      alerts: [],
      eta: "Calculating...",
    };

    routes.unshift(newRoute);
    
    // Clear the inputs
    setSource("");
    setDestination("");

    toast({
      title: "Route Planned",
      description: "New route has been successfully planned.",
    });
  };

  return (
    <Card title="Route Optimization" description="Plan and track your deliveries">
      <div className="space-y-6">
        <div className="grid gap-4 p-4 bg-accent rounded-lg">
          <h3 className="font-medium text-primary-600">Plan New Delivery</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Source Location</label>
              <Input 
                placeholder="Enter farm location" 
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Destination</label>
              <Input 
                placeholder="Enter market location" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>
          <Button 
            className="w-full md:w-auto"
            onClick={handlePlanRoute}
          >
            <Truck className="mr-2 h-4 w-4" />
            Plan Route
          </Button>
        </div>

        <div className="grid gap-4">
          {routes.map((route) => (
            <div key={route.id} className="p-4 bg-accent rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-primary-600">
                    <MapPin className="inline-block mr-1 h-4 w-4" />
                    {route.from} → {route.to}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Status: {route.status} • ETA: {route.eta}
                  </p>
                </div>
                <span className="text-sm font-medium text-green-600">
                  ₹{route.savings} saved
                </span>
              </div>
              
              {route.alerts.length > 0 && (
                <div className="mb-2 p-2 bg-yellow-50 rounded text-sm">
                  <AlertTriangle className="inline-block mr-1 h-4 w-4 text-yellow-500" />
                  {route.alerts.join(", ")}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Route Efficiency</span>
                  <span>{route.efficiency}%</span>
                </div>
                <Progress value={route.efficiency} className="h-2" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-primary-100 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-primary-600">Total Savings</span>
            <span className="text-lg font-bold text-primary-600">
              ₹{routes.reduce((acc, route) => acc + route.savings, 0).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-primary-700 mt-2">
            Savings breakdown: Fuel (40%), Time (35%), Operations (25%)
          </p>
        </div>
      </div>
    </Card>
  );
}
