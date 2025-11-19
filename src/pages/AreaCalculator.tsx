
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AreaMap } from "@/components/area/AreaMap";
import { SavedAreas } from "@/components/area/SavedAreas";
import { Recommendations } from "@/components/area/Recommendations";

export default function AreaCalculator() {
  return (
    <DashboardLayout>
      <div className="container-mobile space-y-4 sm:space-y-6 py-4 sm:py-6">
        <div className="glass-panel p-4 sm:p-6 md:p-8 neon-glow-blue rounded-2xl sm:rounded-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))] bg-clip-text text-transparent">
            Area Calculator
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Calculate and manage your field areas with GPS tracking or interactive map drawing
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <AreaMap />
          <SavedAreas />
          <Recommendations />
        </div>
      </div>
    </DashboardLayout>
  );
}
