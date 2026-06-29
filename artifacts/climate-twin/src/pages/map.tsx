import React, { useState, useRef, useEffect } from "react";
import { useGetMapLayers, getGetMapLayersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Thermometer, 
  CloudRain, 
  Wind, 
  Droplets, 
  AlertTriangle, 
  Info,
  X,
  Compass,
  Layers,
  Activity
} from "lucide-react";

export default function MapPage() {
  const [layer, setLayer] = useState<string>("temperature");
  const { data: mapData, isLoading } = useGetMapLayers(
    { layer: layer as any },
    { query: { queryKey: getGetMapLayersQueryKey({ layer: layer as any }) } }
  );

  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Selection & Interactivity state
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    value: string;
    details?: string;
  }>({ visible: false, x: 0, y: 0, title: "", value: "" });

  const containerRef = useRef<HTMLDivElement>(null);

  // Clear selections when layer changes
  useEffect(() => {
    setSelectedPoint(null);
  }, [layer]);

  // Zoom operations
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 8));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 1));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedPoint(null);
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Avoid starting drag when clicking on markers/buttons
    if ((e.target as HTMLElement).tagName === "circle" || (e.target as HTMLElement).tagName === "path" || (e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
    
    // Update tooltip position if visible
    if (tooltip.visible) {
      setTooltip(prev => ({
        ...prev,
        x: e.clientX,
        y: e.clientY
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scale = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(prev * scale, 1), 8));
  };

  // Unit and Severity Helpers
  const getUnit = () => {
    switch (layer) {
      case "temperature": return "°C";
      case "rainfall": return "mm";
      case "wind": return "km/h";
      case "humidity": return "%";
      case "flood_zones": return "% Risk";
      case "aqi": return "AQI";
      default: return "";
    }
  };

  const getSeverityStyle = (val: number) => {
    switch (layer) {
      case "temperature":
        if (val >= 38) return { bg: "bg-red-500/20", border: "border-red-500", text: "text-red-400", fill: "#ef4444", glow: "rgba(239, 68, 68, 0.4)", label: "Extreme Heat" };
        if (val >= 30) return { bg: "bg-amber-500/20", border: "border-amber-500", text: "text-amber-400", fill: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)", label: "Warm" };
        return { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-400", fill: "#10b981", glow: "rgba(16, 185, 129, 0.4)", label: "Optimal" };
        
      case "rainfall":
        if (val >= 80) return { bg: "bg-violet-500/20", border: "border-violet-500", text: "text-violet-400", fill: "#8b5cf6", glow: "rgba(139, 92, 246, 0.4)", label: "Very Heavy" };
        if (val >= 30) return { bg: "bg-blue-500/20", border: "border-blue-500", text: "text-blue-400", fill: "#3b82f6", glow: "rgba(59, 130, 246, 0.4)", label: "Moderate" };
        return { bg: "bg-slate-500/20", border: "border-slate-500", text: "text-slate-400", fill: "#64748b", glow: "rgba(100, 116, 139, 0.4)", label: "Light" };
        
      case "wind":
        if (val >= 30) return { bg: "bg-rose-500/20", border: "border-rose-500", text: "text-rose-400", fill: "#f43f5e", glow: "rgba(244, 63, 94, 0.4)", label: "High Gale" };
        if (val >= 18) return { bg: "bg-amber-500/20", border: "border-amber-500", text: "text-amber-400", fill: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)", label: "Breezy" };
        return { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-400", fill: "#10b981", glow: "rgba(16, 185, 129, 0.4)", label: "Calm" };
        
      case "humidity":
        if (val >= 75) return { bg: "bg-blue-600/20", border: "border-blue-600", text: "text-blue-300", fill: "#2563eb", glow: "rgba(37, 99, 235, 0.4)", label: "Muggy" };
        if (val >= 40) return { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-400", fill: "#10b981", glow: "rgba(16, 185, 129, 0.4)", label: "Optimal" };
        return { bg: "bg-orange-500/20", border: "border-orange-500", text: "text-orange-400", fill: "#f97316", glow: "rgba(249, 115, 22, 0.4)", label: "Dry" };
        
      case "flood_zones":
        if (val >= 60) return { bg: "bg-red-600/20", border: "border-red-600", text: "text-red-400", fill: "#dc2626", stroke: "rgba(220, 38, 38, 0.4)", label: "High Risk" };
        if (val >= 25) return { bg: "bg-yellow-500/20", border: "border-yellow-500", text: "text-yellow-400", fill: "#eab308", stroke: "rgba(234, 179, 8, 0.4)", label: "Moderate Risk" };
        return { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-400", fill: "#10b981", stroke: "rgba(16, 185, 129, 0.4)", label: "Safe" };
        
      case "aqi":
        if (val >= 150) return { bg: "bg-purple-600/20", border: "border-purple-600", text: "text-purple-400", fill: "#9333ea", glow: "rgba(147, 51, 234, 0.4)", label: "Hazardous" };
        if (val >= 100) return { bg: "bg-orange-500/20", border: "border-orange-500", text: "text-orange-400", fill: "#f97316", glow: "rgba(249, 115, 22, 0.4)", label: "Poor" };
        if (val >= 50) return { bg: "bg-yellow-500/20", border: "border-yellow-500", text: "text-yellow-400", fill: "#eab308", stroke: "rgba(234, 179, 8, 0.4)", label: "Moderate" };
        return { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-400", fill: "#10b981", stroke: "rgba(16, 185, 129, 0.4)", label: "Good" };
        
      default:
        return { bg: "bg-primary/20", border: "border-primary", text: "text-primary", fill: "hsl(var(--primary))", glow: "hsl(var(--primary)/0.4)", label: "Normal" };
    }
  };

  const getLayerIcon = () => {
    switch (layer) {
      case "temperature": return <Thermometer className="h-5 w-5 text-red-400" />;
      case "rainfall": return <CloudRain className="h-5 w-5 text-blue-400" />;
      case "wind": return <Wind className="h-5 w-5 text-indigo-400" />;
      case "humidity": return <Droplets className="h-5 w-5 text-teal-400" />;
      case "flood_zones": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <Activity className="h-5 w-5 text-purple-400" />;
    }
  };

  // Clustering logic
  const getClusters = () => {
    if (!mapData) return [];
    
    // Disable clustering when zoomed in beyond 2.5x
    if (zoom >= 2.5) {
      return mapData.map(p => ({
        isCluster: false,
        points: [p],
        x: 400 + (p.lng - 80) * 16,
        y: 400 - (p.lat - 22) * 20
      }));
    }

    const clusters: Array<{
      isCluster: boolean;
      points: any[];
      x: number;
      y: number;
    }> = [];

    const threshold = 55; // Grouping distance threshold

    mapData.forEach(point => {
      // Map coordinate translation
      const px = 400 + (point.lng - 80) * 16;
      const py = 400 - (point.lat - 22) * 20;
      
      let belongsToCluster = clusters.find(c => {
        const dx = c.x - px;
        const dy = c.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < threshold;
      });

      if (belongsToCluster) {
        belongsToCluster.points.push(point);
        // Centroid update
        belongsToCluster.x = belongsToCluster.points.reduce((sum: number, p: any) => sum + (400 + (p.lng - 80) * 16), 0) / belongsToCluster.points.length;
        belongsToCluster.y = belongsToCluster.points.reduce((sum: number, p: any) => sum + (400 - (p.lat - 22) * 20), 0) / belongsToCluster.points.length;
        belongsToCluster.isCluster = true;
      } else {
        clusters.push({
          isCluster: false,
          points: [point],
          x: px,
          y: py
        });
      }
    });

    return clusters;
  };

  // Interactive callbacks
  const handleMouseEnter = (e: React.MouseEvent, cluster: any) => {
    let title = "";
    let value = "";
    let details = "";
    
    if (cluster.isCluster) {
      title = `${cluster.points.length} Regions Grouped`;
      const avg = cluster.points.reduce((sum: number, p: any) => sum + p.value, 0) / cluster.points.length;
      value = `Avg: ${avg.toFixed(1)} ${getUnit()}`;
      details = cluster.points.map((p: any) => p.district).join(", ");
    } else {
      const p = cluster.points[0];
      title = `${p.district}, ${p.state}`;
      value = `${p.value} ${getUnit()}`;
      details = `${getSeverityStyle(p.value).label} • Lat: ${p.lat.toFixed(1)}, Lng: ${p.lng.toFixed(1)}`;
    }

    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      title,
      value,
      details
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const handleClusterClick = (cluster: any) => {
    if (cluster.isCluster) {
      // Zoom into cluster centroid
      setZoom(prev => Math.min(prev * 1.8, 8));
      setPan({
        x: (400 - cluster.x) * zoom,
        y: (400 - cluster.y) * zoom
      });
    } else {
      setSelectedPoint(cluster.points[0]);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text">Interactive Map</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">Spatial climate layers & telemetry grids</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={layer} onValueChange={setLayer}>
            <SelectTrigger className="w-[200px] bg-card/40 border-primary/30 text-foreground font-mono text-xs">
              <Layers className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Select layer" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-foreground">
              <SelectItem value="temperature">Temperature (°C)</SelectItem>
              <SelectItem value="rainfall">Rainfall (mm)</SelectItem>
              <SelectItem value="wind">Wind Speed (km/h)</SelectItem>
              <SelectItem value="humidity">Humidity (%)</SelectItem>
              <SelectItem value="flood_zones">Flood Risk (%)</SelectItem>
              <SelectItem value="aqi">Air Quality (AQI)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[500px] items-stretch">
        
        {/* Map Window */}
        <Card 
          ref={containerRef}
          className="flex-1 glass-panel border-primary/20 relative overflow-hidden flex flex-col bg-card/30 dark:bg-slate-950/30 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Radial Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08)_0,transparent_75%)] pointer-events-none" />

          {/* Compass and Active Layer HUD Group */}
          <div className="absolute top-4 left-4 z-10 flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 bg-card/85 dark:bg-slate-950/80 border border-border/80 p-2 rounded-lg text-[10px] font-mono text-muted-foreground">
              <Compass className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: '20s' }} />
              <span>LOCATE // IN-GRID</span>
            </div>
            <div className="flex items-center gap-2 bg-card/85 dark:bg-slate-950/80 border border-border/80 px-3 py-1.5 rounded-lg text-xs font-mono text-foreground capitalize">
              {getLayerIcon()}
              <span>Layer: {layer.replace("_", " ")}</span>
            </div>
          </div>

          {/* Legend Panel */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-card/85 dark:bg-slate-950/80 backdrop-blur-md p-3.5 rounded-lg border border-border/80 w-40">
            <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">Metrics Legend</div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">High Severe:</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Moderate/Mid:</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Stable/Low:</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>
          </div>

          {/* Map Content */}
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-center">
                <Skeleton className="w-48 h-48 rounded-full opacity-20 animate-pulse" />
                <div className="font-mono text-xs text-muted-foreground animate-pulse">Syncing satellite telemetry maps...</div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center p-4">
              <svg 
                viewBox="0 0 800 800" 
                className="w-full h-full max-h-full transition-transform duration-100 ease-out select-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center'
                }}
              >
                {/* Tech Grid Lines */}
                <g stroke="hsl(var(--primary)/0.05)" strokeWidth="1" strokeDasharray="3 9">
                  {Array.from({ length: 9 }).map((_, idx) => {
                    const coord = 100 + idx * 75;
                    return (
                      <React.Fragment key={idx}>
                        <line x1={coord} y1="0" x2={coord} y2="800" />
                        <line x1="0" y1={coord} x2="800" y2={coord} />
                      </React.Fragment>
                    );
                  })}
                </g>

                {/* Radar sweep circles */}
                <circle cx="400" cy="400" r="320" fill="none" stroke="hsl(var(--primary)/0.03)" strokeWidth="1" />
                <circle cx="400" cy="400" r="220" fill="none" stroke="hsl(var(--primary)/0.04)" strokeWidth="1.5" />
                <circle cx="400" cy="400" r="120" fill="none" stroke="hsl(var(--primary)/0.05)" strokeWidth="2" />

                {/* Digital India Wireframe Boundary representation */}
                <path 
                  d="M 370,40 L 390,30 L 415,50 L 430,90 L 460,95 L 490,135 L 450,165 L 490,205 L 530,225 L 580,255 L 595,245 L 610,260 L 595,275 L 615,275 L 655,260 L 685,250 L 715,270 L 725,260 L 715,295 L 720,315 L 705,345 L 695,385 L 680,375 L 685,345 L 650,345 L 640,325 L 645,365 L 625,375 L 600,400 L 565,445 L 535,485 L 515,535 L 495,585 L 475,645 L 455,705 L 375,765 L 360,705 L 335,645 L 315,585 L 295,525 L 285,465 L 285,405 L 295,345 L 285,325 L 255,305 L 225,305 L 215,265 L 235,245 L 255,235 L 275,205 L 285,155 L 315,125 L 335,115 L 335,75 Z" 
                  fill="none" 
                  stroke="hsl(var(--primary)/0.35)" 
                  strokeWidth="2.5"
                  className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.2)]"
                />

                {/* Pulsing Sonar Sweeper Path */}
                <path 
                  d="M 370,40 L 390,30 L 415,50 L 430,90 L 460,95 L 490,135 L 450,165 L 490,205 L 530,225 L 580,255 L 595,245 L 610,260 L 595,275 L 615,275 L 655,260 L 685,250 L 715,270 L 725,260 L 715,295 L 720,315 L 705,345 L 695,385 L 680,375 L 685,345 L 650,345 L 640,325 L 645,365 L 625,375 L 600,400 L 565,445 L 535,485 L 515,535 L 495,585 L 475,645 L 455,705 L 375,765 L 360,705 L 335,645 L 315,585 L 295,525 L 285,465 L 285,405 L 295,345 L 285,325 L 255,305 L 225,305 L 215,265 L 235,245 L 255,235 L 275,205 L 285,155 L 315,125 L 335,115 L 335,75 Z" 
                  fill="none" 
                  stroke="hsl(var(--primary)/0.1)" 
                  strokeWidth="6"
                  strokeDasharray="100 600"
                  className="animate-[dash_6s_linear_infinite]"
                  style={{
                    strokeDashoffset: 1000
                  }}
                />

                {/* Render Grouped Clusters & Single Markers */}
                {getClusters().map((c, i) => {
                  const isSelected = !c.isCluster && selectedPoint && selectedPoint.district === c.points[0].district;
                  
                  if (c.isCluster) {
                    // Cluster element
                    return (
                      <g 
                        key={`c-${i}`} 
                        transform={`translate(${c.x}, ${c.y})`} 
                        className="cursor-pointer group"
                        onClick={() => handleClusterClick(c)}
                        onMouseEnter={(e) => handleMouseEnter(e, c)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {/* Dynamic cluster sonar animation */}
                        <circle 
                          r={24 / Math.sqrt(zoom)} 
                          fill="hsl(var(--primary)/0.12)" 
                          stroke="hsl(var(--primary)/0.6)" 
                          strokeWidth="1.5" 
                          className="animate-pulse"
                        />
                        <circle 
                          r={18 / Math.sqrt(zoom)} 
                          fill="hsl(var(--primary)/0.35)" 
                        />
                        <text 
                          y={4 / Math.sqrt(zoom)} 
                          textAnchor="middle" 
                          fill="#ffffff" 
                          fontSize={11 / Math.sqrt(zoom)} 
                          fontWeight="bold" 
                          className="font-mono pointer-events-none"
                        >
                          {c.points.length}
                        </text>
                      </g>
                    );
                  }

                  // Single data point marker
                  const point = c.points[0];
                  const severity = getSeverityStyle(point.value);
                  const baseRadius = 9; // Made larger
                  const pulseRadius = 18; // Made larger
                  
                  return (
                    <g 
                      key={`p-${i}`} 
                      transform={`translate(${c.x}, ${c.y})`} 
                      className="cursor-pointer group"
                      onClick={() => setSelectedPoint(point)}
                      onMouseEnter={(e) => handleMouseEnter(e, c)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Pulsing Outer Radar Circle */}
                      <circle 
                        r={pulseRadius / Math.sqrt(zoom)} 
                        fill="none" 
                        stroke={severity.fill} 
                        strokeWidth="2" 
                        className="animate-ping opacity-60"
                      />
                      
                      {/* Selected Indicator Outline */}
                      {isSelected && (
                        <circle 
                          r={(baseRadius + 6) / Math.sqrt(zoom)} 
                          fill="none" 
                          stroke="#ffffff" 
                          strokeWidth="2" 
                          strokeDasharray="2 2"
                          className="animate-[spin_4s_linear_infinite]"
                        />
                      )}

                      {/* Main Data Color Indicator */}
                      <circle 
                        r={baseRadius / Math.sqrt(zoom)} 
                        fill={severity.fill} 
                        className="opacity-95 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_6px_var(--glow-color)]"
                        style={{
                          // Set CSS glow variable
                          '--glow-color': severity.fill
                        } as any}
                      />
                      
                      {/* Mini Core Value Text inside Marker (Only shown when zoomed in) */}
                      {zoom >= 3.5 && (
                        <text 
                          y="3"
                          textAnchor="middle" 
                          fill="#ffffff" 
                          fontSize="7" 
                          fontWeight="black"
                          className="font-mono pointer-events-none"
                        >
                          {Math.round(point.value)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Interactive Navigation Controls Overlay */}
          <div className="absolute bottom-4 right-4 z-10 flex gap-1.5 bg-card/85 dark:bg-slate-950/80 backdrop-blur-md p-1.5 rounded-lg border border-border/80 shadow-lg">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground" 
              onClick={handleZoomIn} 
              title="Zoom In"
            >
              <ZoomIn className="h-4.5 w-4.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground" 
              onClick={handleZoomOut} 
              title="Zoom Out"
            >
              <ZoomOut className="h-4.5 w-4.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground" 
              onClick={handleReset} 
              title="Reset View"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </Button>
          </div>

          {/* Instructions tag */}
          <div className="absolute bottom-4 left-4 z-10 font-mono text-[9px] text-muted-foreground uppercase tracking-widest pointer-events-none">
            DRAG TO PAN • SCROLL TO ZOOM • CLICK MARKER
          </div>
        </Card>

        {/* Detailed Info Slide-out Panel */}
        {selectedPoint && (
          <Card className="w-full lg:w-[350px] glass-panel border-primary/20 p-5 flex flex-col gap-6 shrink-0 relative overflow-y-auto animate-in slide-in-from-right duration-300">
            <button 
              onClick={() => setSelectedPoint(null)}
              className="absolute top-4 right-4 h-7 w-7 rounded-md border border-border/60 hover:bg-muted/60 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Header info */}
            <div className="mt-2">
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 uppercase font-mono text-[10px] tracking-wider mb-2">
                Climate Profile
              </Badge>
              <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">{selectedPoint.district}</h2>
              <div className="text-xs font-mono text-muted-foreground mt-0.5">{selectedPoint.state}</div>
              <div className="text-[10px] font-mono text-muted-foreground/50 mt-1 uppercase tracking-widest">
                COORD // LAT {selectedPoint.lat.toFixed(3)}°N // LNG {selectedPoint.lng.toFixed(3)}°E
              </div>
            </div>

            {/* Value Dashboard */}
            <div className="bg-muted/40 dark:bg-slate-900/50 border border-border/40 rounded-xl p-4 flex flex-col gap-2 items-center justify-center text-center">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Selected Metric Value</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-display font-black text-foreground">
                  {selectedPoint.value}
                </span>
                <span className="text-lg font-mono text-primary font-bold">
                  {getUnit()}
                </span>
              </div>
              <Badge className={`mt-2 font-mono text-[10px] uppercase ${getSeverityStyle(selectedPoint.value).bg} ${getSeverityStyle(selectedPoint.value).text} border ${getSeverityStyle(selectedPoint.value).border}`}>
                {getSeverityStyle(selectedPoint.value).label}
              </Badge>
            </div>

            {/* Simulated Extended Telemetry Grid for click completeness */}
            <div className="space-y-3">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-1">Telemetry Diagnostics</div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border/40 bg-muted/20 dark:bg-slate-900/20 p-2.5 rounded-lg flex flex-col">
                  <span className="text-[9px] font-mono text-muted-foreground/70 uppercase">Temperature</span>
                  <span className="text-sm font-semibold font-mono mt-0.5 text-foreground">
                    {layer === "temperature" ? `${selectedPoint.value}°C` : `${Math.round(28 + (selectedPoint.lat % 5))}°C`}
                  </span>
                </div>
                
                <div className="border border-border/40 bg-muted/20 dark:bg-slate-900/20 p-2.5 rounded-lg flex flex-col">
                  <span className="text-[9px] font-mono text-muted-foreground/70 uppercase">Rainfall</span>
                  <span className="text-sm font-semibold font-mono mt-0.5 text-foreground">
                    {layer === "rainfall" ? `${selectedPoint.value} mm` : `${Math.round(15 + (selectedPoint.lng % 50))} mm`}
                  </span>
                </div>

                <div className="border border-border/40 bg-muted/20 dark:bg-slate-900/20 p-2.5 rounded-lg flex flex-col">
                  <span className="text-[9px] font-mono text-muted-foreground/70 uppercase">Air Quality</span>
                  <span className="text-sm font-semibold font-mono mt-0.5 text-foreground">
                    {layer === "aqi" ? `${selectedPoint.value} AQI` : `${Math.round(80 + (selectedPoint.lat * 2) % 150)} AQI`}
                  </span>
                </div>

                <div className="border border-border/40 bg-muted/20 dark:bg-slate-900/20 p-2.5 rounded-lg flex flex-col">
                  <span className="text-[9px] font-mono text-muted-foreground/70 uppercase">Wind Velocity</span>
                  <span className="text-sm font-semibold font-mono mt-0.5 text-foreground">
                    {layer === "wind" ? `${selectedPoint.value} km/h` : `${Math.round(10 + (selectedPoint.lng % 25))} km/h`}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations & Dynamic Advisory */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-1">AI Smart Advisory</div>
              <div className="text-xs text-muted-foreground leading-relaxed flex gap-2.5 p-3 rounded-lg border border-border/40 bg-muted/20 dark:bg-slate-900/20">
                <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <span>
                  {layer === "temperature" && selectedPoint.value >= 38 && "Extreme ambient temperature detected. Restrict outdoor exposure between 12 PM - 4 PM."}
                  {layer === "rainfall" && selectedPoint.value >= 80 && "High precipitation rates indicated. Risk of structural waterlogging in low-elevation basins."}
                  {layer === "aqi" && selectedPoint.value >= 150 && "Hazardous air pollutant density. Wear outdoor masks; limit heavy cardiovascular exercise."}
                  {layer === "wind" && selectedPoint.value >= 30 && "High wind velocity warning. Secure non-permanent construction; avoid proximity to high billboards."}
                  {(!["temperature", "rainfall", "aqi", "wind"].includes(layer) || selectedPoint.value < 20) && "Local telemetry indexes are within normal boundaries. No immediate threat alerts."}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Floating HTML Mouse Tooltip */}
      {tooltip.visible && (
        <div 
          className="fixed pointer-events-none z-50 bg-popover/95 dark:bg-slate-950/90 border border-border backdrop-blur-md rounded-lg p-3 text-xs font-mono shadow-2xl flex flex-col gap-1 w-56 text-foreground animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            left: `${tooltip.x + 15}px`, 
            top: `${tooltip.y + 15}px` 
          }}
        >
          <div className="font-sans font-bold text-sm text-primary">{tooltip.title}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-muted-foreground font-sans">Measurement:</span>
            <span className="font-bold font-mono text-foreground">{tooltip.value}</span>
          </div>
          {tooltip.details && (
            <div className="text-[10px] text-muted-foreground/80 mt-1 border-t border-border/40 pt-1">
              {tooltip.details}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}