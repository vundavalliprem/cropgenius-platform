import React from 'react';
import { Button } from "@/components/ui/button";
import { Map, Satellite, Layers } from "lucide-react";

export type MapStyle = 'streets' | 'satellite' | 'hybrid';

interface MapLayerSwitcherProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
}

export function MapLayerSwitcher({ currentStyle, onStyleChange }: MapLayerSwitcherProps) {
  const styles: { id: MapStyle; label: string; icon: React.ReactNode }[] = [
    { id: 'streets', label: 'Normal', icon: <Map className="w-4 h-4" /> },
    { id: 'satellite', label: 'Satellite', icon: <Satellite className="w-4 h-4" /> },
    { id: 'hybrid', label: 'Hybrid', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="glass-panel p-2 rounded-xl inline-flex gap-1">
      {styles.map((style) => (
        <Button
          key={style.id}
          size="sm"
          variant={currentStyle === style.id ? "default" : "ghost"}
          onClick={() => onStyleChange(style.id)}
          className={`${
            currentStyle === style.id
              ? 'bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))] text-white'
              : 'hover:bg-[hsl(var(--neon-blue))]/10'
          } transition-all text-xs sm:text-sm`}
        >
          {style.icon}
          <span className="ml-2 hidden sm:inline">{style.label}</span>
        </Button>
      ))}
    </div>
  );
}
