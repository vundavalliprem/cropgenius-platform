import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { Leaf, Droplet, Sun } from "lucide-react";

export function Recommendations() {
  const recommendations = [
    {
      id: 1,
      title: 'Optimal Crop Selection',
      description: 'Based on soil analysis and area size, corn would be ideal for this plot.',
      icon: Leaf,
    },
    {
      id: 2,
      title: 'Irrigation Planning',
      description: 'Consider drip irrigation to optimize water usage for this field size.',
      icon: Droplet,
    },
    {
      id: 3,
      title: 'Sunlight Exposure',
      description: 'Field orientation provides excellent sun exposure for most crops.',
      icon: Sun,
    },
  ];

  return (
    <Card title="AI Recommendations" description="Suggestions based on field characteristics">
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
            <rec.icon className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">{rec.title}</h4>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}