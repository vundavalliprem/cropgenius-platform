import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AreaMap } from "@/components/area/AreaMap";
import { SavedAreas } from "@/components/area/SavedAreas";
import { Recommendations } from "@/components/area/Recommendations";

export default function AreaCalculator() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Area Calculator</h2>
          <p className="text-muted-foreground">
            Calculate and manage your field areas with GPS tracking or interactive map drawing.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <AreaMap />
          <div className="space-y-6">
            <SavedAreas />
            <Recommendations />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}