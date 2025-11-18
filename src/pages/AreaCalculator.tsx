
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AreaMap } from "@/components/area/AreaMap";
import { SavedAreas } from "@/components/area/SavedAreas";
import { Recommendations } from "@/components/area/Recommendations";

export default function AreaCalculator() {
  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        <div className="glass-panel p-8 neon-glow-blue">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))] bg-clip-text text-transparent">
            Area Calculator
          </h1>
          <p className="text-muted-foreground text-lg">
            Calculate and manage your field areas with GPS tracking or interactive map drawing
          </p>
        </div>

        <div className="space-y-6">
          <AreaMap />
          <SavedAreas />
          <Recommendations />
        </div>
      </div>
    </DashboardLayout>
  );
}
