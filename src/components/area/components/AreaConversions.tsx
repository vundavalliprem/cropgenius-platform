import React from 'react';
import { Ruler, Map, Grid3X3, Square, Home, TreePine, MapPin } from 'lucide-react';
import { UNITS, AreaUnit } from '../hooks/useAreaCalculation';

interface AreaConversionsProps {
  calculatedArea: number | null;
  selectedUnit: AreaUnit;
}

const unitIcons: Record<string, React.ReactNode> = {
  acres: <TreePine className="h-5 w-5" />,
  cents: <Grid3X3 className="h-5 w-5" />,
  gunta: <Home className="h-5 w-5" />,
  sqYards: <Square className="h-5 w-5" />,
  sqMeters: <Map className="h-5 w-5" />,
  hectares: <MapPin className="h-5 w-5" />,
  sqKilometers: <Ruler className="h-5 w-5" />,
  sqMiles: <Ruler className="h-5 w-5" />
};

export function AreaConversions({ calculatedArea, selectedUnit }: AreaConversionsProps) {
  if (calculatedArea === null) return null;

  // Convert to square meters first (base unit)
  const baseAreaInSqMeters = calculatedArea / UNITS[selectedUnit].multiplier;

  // Calculate all conversions
  const conversions = Object.entries(UNITS).map(([key, { label, multiplier }]) => ({
    key,
    label,
    value: Number((baseAreaInSqMeters * multiplier).toFixed(4)),
    icon: unitIcons[key]
  }));

  // Also calculate square feet
  const sqFeet = Number((baseAreaInSqMeters * 10.7639).toFixed(2));

  return (
    <div className="space-y-4">
      {/* Main Result with Glow */}
      <div className="glass-panel p-6 neon-glow-blue animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))] text-white">
            {unitIcons[selectedUnit] || <Ruler className="h-6 w-6" />}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Calculated Area</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))] bg-clip-text text-transparent">
              {calculatedArea}
            </p>
          </div>
          <div className="ml-auto">
            <p className="text-xl font-semibold text-foreground">{UNITS[selectedUnit].label}</p>
          </div>
        </div>
      </div>

      {/* All Conversions Grid */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Ruler className="h-5 w-5 text-[hsl(var(--neon-blue))]" />
          Automatic Conversions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {conversions.map(({ key, label, value, icon }) => (
            <div
              key={key}
              className="p-4 rounded-xl border border-[hsl(var(--neon-blue))]/20 bg-background/50 hover:bg-background/80 transition-all hover:scale-105 hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2 text-[hsl(var(--neon-blue))]">
                {icon}
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
              </div>
              <p className="text-xl font-bold text-foreground">{value.toLocaleString()}</p>
            </div>
          ))}
          
          {/* Square Feet */}
          <div className="p-4 rounded-xl border border-[hsl(var(--neon-purple))]/20 bg-background/50 hover:bg-background/80 transition-all hover:scale-105 hover:shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-[hsl(var(--neon-purple))]">
              <Square className="h-5 w-5" />
              <p className="text-xs font-medium text-muted-foreground">Square Feet</p>
            </div>
            <p className="text-xl font-bold text-foreground">{sqFeet.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
