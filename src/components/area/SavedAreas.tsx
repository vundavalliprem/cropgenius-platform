import React from 'react';
import { Card } from "@/components/ui/dashboard/Card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export function SavedAreas() {
  const savedAreas = [
    { id: 1, name: 'North Field', area: 12.5, unit: 'acres' },
    { id: 2, name: 'South Pasture', area: 8.3, unit: 'acres' },
    { id: 3, name: 'East Plot', area: 5.7, unit: 'acres' },
  ];

  return (
    <Card title="Saved Areas" description="Your saved field measurements">
      <div className="divide-y">
        {savedAreas.map((area) => (
          <div key={area.id} className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">{area.name}</h4>
              <p className="text-sm text-muted-foreground">
                {area.area} {area.unit}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}