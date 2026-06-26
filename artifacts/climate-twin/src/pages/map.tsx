import React, { useState } from "react";
import { useGetMapLayers, getGetMapLayersQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function MapPage() {
  const [layer, setLayer] = useState<string>("temperature");
  const { data: mapData, isLoading } = useGetMapLayers(
    { layer: layer as any },
    { query: { queryKey: getGetMapLayersQueryKey({ layer: layer as any }) } }
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text">Interactive Map</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">Spatial climate data visualization</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={layer} onValueChange={setLayer}>
            <SelectTrigger className="w-[180px] bg-background/50 border-primary/50 text-primary">
              <SelectValue placeholder="Select layer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="rainfall">Rainfall</SelectItem>
              <SelectItem value="wind">Wind</SelectItem>
              <SelectItem value="humidity">Humidity</SelectItem>
              <SelectItem value="flood_zones">Flood Zones</SelectItem>
              <SelectItem value="aqi">AQI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="flex-1 glass-panel border-primary/20 relative overflow-hidden min-h-[500px]">
        {/* Mock Map visualization */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1)_0,transparent_70%)] pointer-events-none" />
        
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-border/50">
          <div className="text-xs font-mono text-muted-foreground mb-1 uppercase">Legend</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-blue-500/80"></div>
            <span className="text-xs">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-yellow-500/80"></div>
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-red-500/80"></div>
            <span className="text-xs">High</span>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="w-3/4 h-3/4 rounded-full opacity-20" />
          </div>
        ) : (
          <div className="w-full h-full relative flex items-center justify-center p-8">
            <svg viewBox="0 0 800 800" className="w-full h-full max-h-full drop-shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
              {/* Simplified India Map Outline representation */}
              <path 
                d="M 300,100 L 400,50 L 500,150 L 600,200 L 700,300 L 650,400 L 600,500 L 550,600 L 450,750 L 400,780 L 350,700 L 250,550 L 200,450 L 150,350 L 200,250 Z" 
                fill="none" 
                stroke="hsl(var(--primary)/0.4)" 
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              
              {/* Data points */}
              {mapData?.map((point, i) => {
                // Map lat/lng roughly to SVG coordinates (mock mapping)
                const x = 400 + (point.lng - 80) * 20;
                const y = 400 - (point.lat - 20) * 20;
                
                // Color based on value
                let color = "hsl(var(--primary))";
                if (layer === "temperature") {
                  color = point.value > 35 ? "hsl(var(--destructive))" : point.value > 25 ? "hsl(var(--chart-4))" : "hsl(var(--primary))";
                } else if (layer === "rainfall") {
                  color = point.value > 50 ? "hsl(var(--primary))" : point.value > 10 ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground))";
                }
                
                return (
                  <g key={i} transform={`translate(${x}, ${y})`} className="group cursor-pointer">
                    <circle 
                      r={Math.max(4, point.value / 10)} 
                      fill={color} 
                      className="opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                    <circle 
                      r={Math.max(4, point.value / 10)} 
                      fill="none" 
                      stroke={color} 
                      className="animate-ping opacity-75"
                    />
                    {/* Tooltip on hover */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <rect x="-60" y="-40" width="120" height="30" rx="4" fill="hsl(var(--background))" stroke="hsl(var(--border))" />
                      <text x="0" y="-20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12" className="font-mono">
                        {point.district}: {point.value}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </Card>
    </div>
  );
}