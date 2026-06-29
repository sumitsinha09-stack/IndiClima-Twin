import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  useGetClimateExplorerLocations,
  getGetClimateExplorerLocationsQueryKey,
  useGetClimateExplorerData,
  getGetClimateExplorerDataQueryKey,
  type ExplorerLocation,
  type ExplorerClimateData,
  type ExplorerDailyForecast,
  type DisasterRiskDetail,
  type MonthlyHistoricalData
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MapPin,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Compass,
  Eye,
  Sun,
  Cloud,
  CloudLightning,
  CloudFog,
  Snowflake,
  Flame,
  Activity,
  Calendar,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Share2,
  Copy,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layers,
  CalendarDays,
  Clock,
  Columns
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";

// Custom styles for weather animations, glow filters and comparison sliders
const WEATHER_STYLES = `
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes drift {
  0% { transform: translateX(0px); }
  50% { transform: translateX(6px); }
  100% { transform: translateX(0px); }
}
@keyframes drip {
  0% { transform: translateY(0px); opacity: 0; }
  30% { opacity: 0.9; }
  100% { transform: translateY(16px); opacity: 0; }
}
@keyframes flash {
  0%, 90%, 94%, 98%, 100% { opacity: 0.1; }
  92%, 96% { opacity: 1; }
}
@keyframes wind-gust {
  0% { transform: translateX(-5px) skewX(-5deg); opacity: 0.3; }
  50% { transform: translateX(5px) skewX(5deg); opacity: 0.8; }
  100% { transform: translateX(-5px) skewX(-5deg); opacity: 0.3; }
}
.weather-spin { animation: spin-slow 12s linear infinite; }
.weather-drift { animation: drift 4s ease-in-out infinite; }
.weather-drip { animation: drip 1.5s linear infinite; }
.weather-flash { animation: flash 6s ease-in-out infinite; }
.weather-wind { animation: wind-gust 3s ease-in-out infinite; }

.glass-card {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.light .glass-card {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.neon-glow {
  text-shadow: 0 0 10px rgba(14, 165, 233, 0.4);
}
.light .neon-glow {
  text-shadow: none;
}
`;

// Helper component for animated weather conditions
const AnimatedWeatherIllustration = ({ condition, className = "w-16 h-16" }: { condition: string, className?: string }) => {
  switch (condition) {
    case 'sunny':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <Sun className="w-full h-full text-amber-400 weather-spin filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
        </div>
      );
    case 'cloudy':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <Cloud className="w-10 h-10 text-slate-400 absolute translate-y-[-2px] translate-x-[-4px] weather-drift" />
          <Cloud className="w-12 h-12 text-slate-300 relative translate-y-[4px] translate-x-[4px] opacity-90" />
        </div>
      );
    case 'rain':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <Cloud className="w-12 h-12 text-slate-300 relative z-10" />
          <div className="absolute inset-0 flex justify-around px-3 pt-8 z-0">
            <span className="w-0.5 h-3 bg-sky-400 rounded-full weather-drip" style={{ animationDelay: '0.1s' }} />
            <span className="w-0.5 h-3 bg-sky-400 rounded-full weather-drip" style={{ animationDelay: '0.4s' }} />
            <span className="w-0.5 h-3 bg-sky-400 rounded-full weather-drip" style={{ animationDelay: '0.7s' }} />
          </div>
        </div>
      );
    case 'thunderstorm':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <Cloud className="w-12 h-12 text-slate-400 relative z-10" />
          <CloudLightning className="w-8 h-8 text-yellow-400 absolute translate-y-[10px] z-20 weather-flash" />
          <div className="absolute inset-0 flex justify-around px-3 pt-8 z-0">
            <span className="w-0.5 h-3 bg-sky-500 rounded-full weather-drip" style={{ animationDelay: '0s' }} />
            <span className="w-0.5 h-3 bg-sky-500 rounded-full weather-drip" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      );
    case 'fog':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <CloudFog className="w-12 h-12 text-slate-300 weather-drift" />
          <div className="absolute bottom-1 w-10 h-0.5 bg-slate-500/50 weather-wind" />
          <div className="absolute bottom-3 w-8 h-0.5 bg-slate-500/30 weather-wind" style={{ animationDelay: '0.5s' }} />
        </div>
      );
    case 'snow':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <Snowflake className="w-12 h-12 text-blue-200 weather-spin" />
        </div>
      );
    default:
      return <Sun className={`text-amber-400 ${className}`} />;
  }
};

// Weather Condition Color Gradients map
const THEME_GRADIENTS: Record<string, string> = {
  sunny: "from-amber-100/40 dark:from-amber-950/20 via-background/90 dark:via-slate-900/90 to-background dark:to-slate-950",
  cloudy: "from-slate-200/40 dark:from-slate-800/20 via-background/90 dark:via-slate-900/90 to-background dark:to-slate-950",
  rain: "from-sky-200/50 dark:from-sky-950/30 via-background/90 dark:via-slate-900/90 to-background dark:to-slate-950",
  thunderstorm: "from-violet-200/50 dark:from-violet-950/30 via-background/90 dark:via-slate-900/90 to-background dark:to-slate-950",
  fog: "from-blue-200/30 dark:from-blue-950/20 via-background/90 dark:via-slate-900/90 to-background dark:to-slate-950",
  snow: "from-cyan-200/30 dark:from-cyan-950/20 via-background/90 dark:via-slate-900/90 to-background dark:to-slate-950"
};

export default function ClimateExplorer() {
  const { toast } = useToast();

  // Location selector state
  const [selectedState, setSelectedState] = useState<string>("Maharashtra");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Mumbai");
  const [selectedCity, setSelectedCity] = useState<string>("Mumbai");

  // Autocomplete / Search filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Favorites state
  const [favorites, setFavorites] = useState<ExplorerLocation[]>([]);

  // Split-screen comparator drawer state
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compCity, setCompCity] = useState<string>("Delhi");

  // GIS layers selection
  const [gisLayer1, setGisLayer1] = useState<string>("temperature");
  const [gisLayer2, setGisLayer2] = useState<string>("rainfall");
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreenGis, setIsFullscreenGis] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Fetch locations
  const { data: locations = [] } = useGetClimateExplorerLocations({
    query: { queryKey: getGetClimateExplorerLocationsQueryKey() }
  });

  // Filter lists based on state/district hierarchy
  const statesList = useMemo(() => Array.from(new Set(locations.map(l => l.state))).sort(), [locations]);
  const districtsList = useMemo(() => {
    return Array.from(new Set(locations.filter(l => l.state === selectedState).map(l => l.district))).sort();
  }, [locations, selectedState]);
  const citiesList = useMemo(() => {
    return locations.filter(l => l.state === selectedState && l.district === selectedDistrict).map(l => l.city).sort();
  }, [locations, selectedState, selectedDistrict]);

  // Autocomplete filter matching search queries
  const filteredSearchList = useMemo(() => {
    if (!searchQuery) return [];
    return locations.filter(l =>
      l.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.state.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);
  }, [locations, searchQuery]);

  // Load favorites from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("climatetwin_explorer_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // Save favorite handler
  const toggleFavorite = (loc: ExplorerLocation) => {
    const exists = favorites.some(f => f.city.toLowerCase() === loc.city.toLowerCase());
    let updated;
    if (exists) {
      updated = favorites.filter(f => f.city.toLowerCase() !== loc.city.toLowerCase());
      toast({
        title: "Location Removed",
        description: `${loc.city} removed from saved list.`
      });
    } else {
      updated = [...favorites, loc];
      toast({
        title: "Location Saved",
        description: `${loc.city} added to saved list.`
      });
    }
    setFavorites(updated);
    localStorage.setItem("climatetwin_explorer_favorites", JSON.stringify(updated));
  };

  // Fetch explorer details for primary selected location
  const { data: explorerData, isLoading: loadingPrimary } = useGetClimateExplorerData(
    { state: selectedState, district: selectedDistrict, city: selectedCity },
    {
      query: {
        queryKey: getGetClimateExplorerDataQueryKey({ state: selectedState, district: selectedDistrict, city: selectedCity }),
        enabled: !!selectedCity
      }
    }
  );

  // Fetch explorer details for comparator city
  const compLocation = useMemo(() => {
    return locations.find(l => l.city.toLowerCase() === compCity.toLowerCase()) || locations[0];
  }, [locations, compCity]);

  const { data: compData, isLoading: loadingComp } = useGetClimateExplorerData(
    { state: compLocation?.state, district: compLocation?.district, city: compLocation?.city },
    {
      query: {
        queryKey: getGetClimateExplorerDataQueryKey({ state: compLocation?.state, district: compLocation?.district, city: compLocation?.city }),
        enabled: compareMode && !!compLocation
      }
    }
  );

  // Dynamic weather-dependent background gradient
  const pageBgGradient = useMemo(() => {
    if (!explorerData?.current?.condition) return "from-slate-100 via-background to-background dark:from-slate-900 dark:via-slate-900 dark:to-slate-950";
    return THEME_GRADIENTS[explorerData.current.condition] || "from-slate-100 via-background to-background dark:from-slate-900 dark:via-slate-900 dark:to-slate-950";
  }, [explorerData]);

  // Handler to select location from autocomplete search
  const handleSelectLocation = (loc: ExplorerLocation) => {
    setSelectedState(loc.state);
    setSelectedDistrict(loc.district);
    setSelectedCity(loc.city);
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Handle map click
  const handleMapStateClick = (stateName: string) => {
    const match = locations.find(l => l.state.toLowerCase() === stateName.toLowerCase());
    if (match) {
      setSelectedState(match.state);
      setSelectedDistrict(match.district);
      setSelectedCity(match.city);
      toast({
        title: "Region Selected",
        description: `Switched view to ${match.city}, ${match.state}`
      });
    }
  };

  // Export report PDF (triggers backend API report endpoint)
  const downloadPdfReport = () => {
    if (!explorerData) return;
    const url = `/api/climate/explorer/report?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&city=${encodeURIComponent(selectedCity)}`;
    window.open(url, "_blank");
    toast({
      title: "Generating PDF Report",
      description: `Downloading report for ${selectedCity}...`
    });
  };

  // Export forecast to CSV
  const exportForecastToCsv = () => {
    if (!explorerData?.forecast?.daily) return;
    const daily = explorerData.forecast.daily;
    const headers = "Date,Max Temp (C),Min Temp (C),Rainfall (mm),Wind Speed (km/h),Humidity (%),Condition\n";
    const rows = daily.map(d =>
      `"${d.date}",${d.maxTemp},${d.minTemp},${d.rainfall},${d.windSpeed ?? 10},${d.humidity},"${d.condition}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `IndiClima_Twin_Forecast_${selectedCity.replace(" ", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Data Exported",
      description: `Forecast data for ${selectedCity} exported as CSV.`
    });
  };

  // Share report link
  const shareReportLink = () => {
    const shareUrl = `${window.location.origin}/climate-explorer?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}&city=${encodeURIComponent(selectedCity)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied!",
        description: "Shareable link copied to clipboard."
      });
    });
  };

  // Copy AI summary
  const copyAiSummary = () => {
    if (!explorerData?.aiSummary) return;
    navigator.clipboard.writeText(explorerData.aiSummary).then(() => {
      toast({
        title: "Summary Copied",
        description: "AI summary copied to clipboard."
      });
    });
  };

  // Draggable slider mouse events for split comparative map
  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleSliderMove(e.clientX);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Read URL query params on load to support share link pre-selections
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uState = params.get("state");
    const uDist = params.get("district");
    const uCity = params.get("city");
    if (uState && uDist && uCity) {
      setSelectedState(uState);
      setSelectedDistrict(uDist);
      setSelectedCity(uCity);
    }
  }, []);

  return (
    <div className={`space-y-8 min-h-screen pb-16 bg-gradient-to-b ${pageBgGradient} transition-all duration-700 ease-in-out`}>
      <style>{WEATHER_STYLES}</style>
      
      {/* ─── HEADER BAR ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <Compass className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-3xl font-display font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Climate Explorer & Forecast Intelligence
            </h1>
          </div>
          <p className="text-muted-foreground font-mono text-xs mt-1 uppercase tracking-widest">
            Multi-Source Spatial Digital Twin of India
          </p>
        </div>
        
        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {explorerData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFavorite(explorerData.location)}
              className="border-primary/30 bg-primary/5 hover:bg-primary/10 text-foreground"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {favorites.some(f => f.city.toLowerCase() === selectedCity.toLowerCase()) ? "Saved" : "Save Favorite"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompareMode(!compareMode)}
            className={`border-indigo-500/30 ${compareMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-500/5'} hover:bg-indigo-500/10`}
          >
            <Columns className="w-4 h-4 mr-1.5" />
            Compare Cities
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={downloadPdfReport}
            className="border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Export PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportForecastToCsv}
            className="border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={shareReportLink}
            className="border-slate-500/30 bg-slate-500/5 hover:bg-slate-500/10 text-slate-300"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            Share Link
          </Button>
        </div>
      </div>

      {/* ─── LOCATION SELECTORS PANEL ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Text selectors and Search */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="glass-card border-white/5 relative overflow-visible">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none" />
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold tracking-wide flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Query Spatial Databases
              </CardTitle>
              <CardDescription className="text-xs">
                Select location via query hierarchies or live fuzzy search autocomplete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative overflow-visible">
              {/* Fuzzy Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Search state, district, or city in India (e.g. Mumbai, Darjeeling, Shimla)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="block w-full pl-10 pr-4 py-2 text-sm bg-muted/40 border border-border/80 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
                
                {/* Search Autocomplete Dropdown list */}
                {showDropdown && searchQuery && (
                  <div className="absolute z-50 w-full mt-1.5 bg-popover border border-border rounded-md shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                    {filteredSearchList.length === 0 ? (
                      <div className="py-2.5 px-4 text-xs text-muted-foreground">No matching locations found</div>
                    ) : (
                      filteredSearchList.map((loc, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectLocation(loc)}
                          className="py-2 px-4 text-sm hover:bg-accent/40 cursor-pointer flex items-center justify-between border-b border-border/30"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span className="font-medium text-foreground">{loc.city}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{loc.district}, {loc.state}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Hierarchical dropdown selectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">State</label>
                  <Select value={selectedState} onValueChange={(val) => {
                    setSelectedState(val);
                    const match = locations.find(l => l.state === val);
                    if (match) {
                      setSelectedDistrict(match.district);
                      setSelectedCity(match.city);
                    }
                  }}>
                    <SelectTrigger className="bg-muted/30 border-border/60">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">District</label>
                  <Select value={selectedDistrict} onValueChange={(val) => {
                    setSelectedDistrict(val);
                    const match = locations.find(l => l.state === selectedState && l.district === val);
                    if (match) setSelectedCity(match.city);
                  }}>
                    <SelectTrigger className="bg-muted/30 border-border/60">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtsList.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">City</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="bg-muted/30 border-border/60">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {citiesList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Favorites quick selection bar */}
          {favorites.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-mono uppercase text-muted-foreground shrink-0">Favorites:</span>
              {favorites.map((fav, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  onClick={() => {
                    setSelectedState(fav.state);
                    setSelectedDistrict(fav.district);
                    setSelectedCity(fav.city);
                  }}
                  className="cursor-pointer border-white/10 bg-slate-900/40 hover:bg-primary/20 text-foreground py-1 px-2.5 transition-colors gap-1.5 flex items-center"
                >
                  <MapPin className="w-3 h-3 text-primary" />
                  {fav.city}
                  <Trash2
                    className="w-3 h-3 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(fav);
                    }}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Tactical interactive Map of India */}
        <div className="lg:col-span-4">
          <Card className="glass-card border-white/5 h-full relative overflow-hidden flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-sky-400">
                <Layers className="w-4 h-4" />
                State Selector Map
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-3 relative min-h-[220px]">
              <svg viewBox="0 0 800 650" className="w-full h-full max-h-[230px] drop-shadow-[0_0_8px_rgba(14,165,233,0.15)]">
                {/* Tactical radar gird lines */}
                <circle cx="450" cy="300" r="280" fill="none" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                <circle cx="450" cy="300" r="180" fill="none" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                <line x1="450" y1="20" x2="450" y2="580" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                <line x1="170" y1="300" x2="730" y2="300" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />

                {/* Stylized polygons representing states */}
                {/* J&K */}
                <polygon
                  points="360,60 410,30 460,70 420,110 380,100"
                  fill={selectedState === "J&K" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "J&K" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("J&K")}
                />
                {/* Himachal / Uttarakhand */}
                <polygon
                  points="410,110 470,90 490,130 450,150 420,130"
                  fill={selectedState === "Himachal Pradesh" || selectedState === "Uttarakhand" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Himachal Pradesh" || selectedState === "Uttarakhand" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Himachal Pradesh")}
                />
                {/* Punjab / Chandigarh */}
                <polygon
                  points="360,110 410,110 420,130 420,160 380,160"
                  fill={selectedState === "Punjab" || selectedState === "Chandigarh" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Punjab" || selectedState === "Chandigarh" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Punjab")}
                />
                {/* Rajasthan */}
                <polygon
                  points="280,160 380,160 400,220 320,260 270,220"
                  fill={selectedState === "Rajasthan" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Rajasthan" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Rajasthan")}
                />
                {/* Uttar Pradesh */}
                <polygon
                  points="420,160 500,140 560,190 520,240 440,230 415,200"
                  fill={selectedState === "Uttar Pradesh" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Uttar Pradesh" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Uttar Pradesh")}
                />
                {/* Gujarat */}
                <polygon
                  points="220,230 300,230 310,260 270,300 210,280"
                  fill={selectedState === "Gujarat" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Gujarat" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Gujarat")}
                />
                {/* Madhya Pradesh */}
                <polygon
                  points="380,230 450,230 520,250 480,320 370,300"
                  fill={selectedState === "Madhya Pradesh" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Madhya Pradesh" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Madhya Pradesh")}
                />
                {/* Maharashtra */}
                <polygon
                  points="280,310 370,310 430,340 380,410 290,380 270,350"
                  fill={selectedState === "Maharashtra" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Maharashtra" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Maharashtra")}
                />
                {/* Bihar */}
                <polygon
                  points="530,195 610,190 620,235 550,240"
                  fill={selectedState === "Bihar" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Bihar" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Bihar")}
                />
                {/* West Bengal */}
                <polygon
                  points="610,190 645,185 640,245 610,270 595,240"
                  fill={selectedState === "West Bengal" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "West Bengal" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("West Bengal")}
                />
                {/* Odisha */}
                <polygon
                  points="515,280 580,260 610,310 565,350"
                  fill={selectedState === "Odisha" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Odisha" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Odisha")}
                />
                {/* Karnataka */}
                <polygon
                  points="290,400 370,410 365,490 310,480 290,440"
                  fill={selectedState === "Karnataka" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Karnataka" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Karnataka")}
                />
                {/* Andhra / Telangana */}
                <polygon
                  points="370,390 450,340 460,430 385,490"
                  fill={selectedState === "Telangana" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Telangana" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Telangana")}
                />
                {/* Kerala */}
                <polygon
                  points="310,490 345,490 335,570 315,560"
                  fill={selectedState === "Kerala" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Kerala" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Kerala")}
                />
                {/* Tamil Nadu */}
                <polygon
                  points="345,490 385,490 380,570 335,570"
                  fill={selectedState === "Tamil Nadu" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Tamil Nadu" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Tamil Nadu")}
                />
                {/* Assam & NE */}
                <polygon
                  points="650,180 730,160 760,210 710,245 650,235"
                  fill={selectedState === "Assam" || selectedState === "Tripura" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.03)"}
                  stroke={selectedState === "Assam" || selectedState === "Tripura" ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
                  className="cursor-pointer hover:fill-primary/20 transition-colors duration-200"
                  onClick={() => handleMapStateClick("Assam")}
                />

                {/* Plot City Node Marker */}
                {explorerData && (
                  <g transform={`translate(${450 + (explorerData.location.lng - 80) * 15}, ${300 - (explorerData.location.lat - 21) * 15})`}>
                    <circle r="6" className="fill-primary animate-ping" />
                    <circle r="4" className="fill-primary stroke-white stroke-2" />
                  </g>
                )}
              </svg>
            </CardContent>
            <div className="bg-slate-900/60 py-1.5 px-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-muted-foreground shrink-0">
              <span>LAT: {explorerData?.location.lat.toFixed(4) || "0.00"} N</span>
              <span>LNG: {explorerData?.location.lng.toFixed(4) || "0.00"} E</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Loading Skeletal State */}
      {loadingPrimary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => <Skeleton key={n} className="h-28 w-full rounded-lg bg-white/5" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full rounded-lg bg-white/5" />
            <Skeleton className="h-96 w-full rounded-lg bg-white/5" />
          </div>
        </div>
      ) : !explorerData ? (
        <div className="text-center py-16 text-muted-foreground">Select a location to explore telemetry databases</div>
      ) : (
        <>
          {/* ─── CURRENT WEATHER SNAPSHOT (TELEMETRY HUB) ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Primary Status Card with Illustration */}
            <div className="lg:col-span-4">
              <Card className="glass-card border-white/5 relative overflow-hidden h-full flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-primary/10 to-transparent pointer-events-none" />
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{explorerData.location.city}</CardTitle>
                      <CardDescription className="text-xs font-mono uppercase text-muted-foreground">
                        {explorerData.location.district}, {explorerData.location.state}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary font-mono text-[10px] capitalize">
                      {explorerData.location.zone} Zone
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                  <AnimatedWeatherIllustration condition={explorerData.current.condition} className="w-24 h-24 mb-4" />
                  <div className="text-5xl font-display font-extrabold text-foreground tracking-tighter">
                    {explorerData.current.temperature.toFixed(1)}&deg;C
                  </div>
                  <div className="text-sm font-medium text-slate-300 capitalize mt-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {explorerData.current.condition} Conditions
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">
                    Feels like {explorerData.current.feelsLike.toFixed(1)}&deg;C | Dew Point {explorerData.current.dewPoint.toFixed(1)}&deg;C
                  </div>
                </CardContent>

                <div className="bg-muted/30 p-4 border-t border-border/40 grid grid-cols-2 gap-4 text-xs font-mono text-center shrink-0">
                  <div>
                    <span className="block text-muted-foreground text-[10px] uppercase">Sunrise</span>
                    <span className="font-bold text-foreground">{explorerData.current.sunrise} AM</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground text-[10px] uppercase">Sunset</span>
                    <span className="font-bold text-foreground">{explorerData.current.sunset} PM</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Grid of Gauges and Secondary Telemetry Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Temp Min/Max */}
              <Card className="bg-muted/15 dark:bg-slate-900/20 border-border/40 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                  <span className="text-xs font-mono uppercase text-muted-foreground">Temp Range</span>
                  <Thermometer className="h-4 w-4 text-sky-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-display text-foreground">
                    {explorerData.current.minTemp}&deg;C / {explorerData.current.maxTemp}&deg;C
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">Daily Minimum / Maximum</p>
                </CardContent>
              </Card>

              {/* Humidity */}
              <Card className="bg-muted/15 dark:bg-slate-900/20 border-border/40 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                  <span className="text-xs font-mono uppercase text-muted-foreground">Humidity</span>
                  <Droplets className="h-4 w-4 text-sky-400" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xl font-bold font-display text-foreground">
                    {explorerData.current.humidity}%
                  </div>
                  <Progress value={explorerData.current.humidity} className="h-1 bg-muted/40 dark:bg-white/5" />
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">Relative Moisture Index</p>
                </CardContent>
              </Card>

              {/* Precipitation */}
              <Card className="bg-muted/15 dark:bg-slate-900/20 border-border/40 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                  <span className="text-xs font-mono uppercase text-muted-foreground">Precipitation</span>
                  <CloudRain className="h-4 w-4 text-sky-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-display text-foreground">
                    {explorerData.current.rainfall.toFixed(1)} mm
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">Past 24 Hours Cumulative</p>
                </CardContent>
              </Card>

              {/* Wind Flow */}
              <Card className="bg-muted/15 dark:bg-slate-900/20 border-border/40 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                  <span className="text-xs font-mono uppercase text-muted-foreground">Wind Velocity</span>
                  <Wind className="h-4 w-4 text-sky-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-display text-foreground">
                    {explorerData.current.windSpeed} <span className="text-xs font-normal">km/h</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">
                    Direction: {explorerData.current.windDirection} ({explorerData.current.windDirectionDeg}&deg;)
                  </p>
                </CardContent>
              </Card>

              {/* AQI Indicator */}
              <Card className="bg-muted/15 dark:bg-slate-900/20 border-border/40 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                  <span className="text-xs font-mono uppercase text-muted-foreground">AQI Level</span>
                  <Activity className="h-4 w-4 text-sky-400" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xl font-bold font-display text-foreground">
                    {explorerData.current.aqi}
                  </div>
                  <Progress
                    value={Math.min(100, (explorerData.current.aqi / 300) * 100)}
                    className={`h-1 bg-muted/40 dark:bg-white/5 [&>div]:bg-sky-400`}
                  />
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">CPCB Air Quality Standard</p>
                </CardContent>
              </Card>

              {/* UV Index */}
              <Card className="bg-muted/15 dark:bg-slate-900/20 border-border/40 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                  <span className="text-xs font-mono uppercase text-muted-foreground">UV Intensity</span>
                  <Sun className="h-4 w-4 text-sky-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-display text-foreground">
                    {explorerData.current.uvIndex} <span className="text-xs font-normal">/ 11</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">Solar Radiation Risk Index</p>
                </CardContent>
              </Card>

              {/* Pressure & Visibility */}
              <Card className="bg-muted/15 dark:bg-slate-900/20 border-border/40 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                  <span className="text-xs font-mono uppercase text-muted-foreground">Atmosphere</span>
                  <Compass className="h-4 w-4 text-sky-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold font-display text-foreground">
                    Baro: {explorerData.current.airPressure} hPa
                  </div>
                  <div className="text-sm font-bold font-display text-foreground mt-1">
                    Vis: {explorerData.current.visibility} km
                  </div>
                </CardContent>
              </Card>

              {/* Soil Moisture */}
              <Card className="bg-muted/15 dark:bg-slate-900/20 border-border/40 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                  <span className="text-xs font-mono uppercase text-muted-foreground">Soil Moisture</span>
                  <Layers className="h-4 w-4 text-sky-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-display text-foreground">
                    {explorerData.current.soilMoisture !== null ? `${(explorerData.current.soilMoisture * 100).toFixed(0)}%` : "N/A"}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">
                    {explorerData.current.soilMoisture !== null ? "ISRO VEDAS Estimations" : "Sensor unavailable in region"}
                  </p>
                </CardContent>
              </Card>

              {/* Heat Index */}
              <Card className="bg-muted/15 dark:bg-slate-900/20 border-border/40 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                  <span className="text-xs font-mono uppercase text-muted-foreground">Heat Index</span>
                  <Thermometer className="h-4 w-4 text-sky-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-display text-foreground">
                    {explorerData.current.heatIndex.toFixed(1)}&deg;C
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">Ambient thermal discomfort assessment</p>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* ─── AI CLIMATE SUMMARY PANEL ─── */}
          <Card className="glass-card border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08)_0,transparent_60%)] pointer-events-none" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold tracking-wide flex items-center gap-2 text-primary">
                <Activity className="w-5 h-5" />
                AI Command Center Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm md:text-base leading-relaxed text-slate-200 font-sans italic border-l-2 border-primary/50 pl-4 py-1">
                "{explorerData.aiSummary}"
              </div>
              <div className="flex items-center gap-2.5">
                <Button size="sm" variant="ghost" onClick={copyAiSummary} className="text-xs hover:bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground">
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Text
                </Button>
                <Button size="sm" variant="ghost" onClick={shareReportLink} className="text-xs hover:bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground">
                  <Share2 className="w-3.5 h-3.5 mr-1.5" />
                  Share Summary
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ─── TEMPERATURE TRAJECTORY PREDICTION (FORECASTS) ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Forecast Chart Panel */}
            <div className="lg:col-span-8">
              <Card className="glass-card border-white/5 h-full">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Predictive Temperature Trajectory</CardTitle>
                    <CardDescription className="text-xs">
                      LSTM neural net forecasting showing diurnal temperature fluctuations with confidence limits
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 font-mono text-[10px]">
                      Accuracy: {explorerData.forecast.forecastAccuracy}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={explorerData.forecast.hourly.slice(0, 36)}>
                        <defs>
                          <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.01}/>
                          </linearGradient>
                          <linearGradient id="boundsGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgba(255,255,255,0.05)" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="rgba(255,255,255,0.05)" stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="time"
                          tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          stroke="rgba(255,255,255,0.3)"
                          fontSize={10}
                        />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={['auto', 'auto']} unit="&deg;C" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)' }}
                          labelStyle={{ color: 'hsl(var(--primary))' }}
                          labelFormatter={(label) => new Date(label).toLocaleString()}
                        />
                        
                        {/* Shaded Area for upper/lower bounds */}
                        <Area
                          type="monotone"
                          dataKey="tempUpper"
                          stroke="transparent"
                          fill="url(#boundsGlow)"
                        />
                        <Area
                          type="monotone"
                          dataKey="tempLower"
                          stroke="transparent"
                          fill="transparent"
                        />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                          name="Predicted Temp"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily cards (next 7 days) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <Card className="glass-card border-white/5 flex-1 flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-sky-400">
                    7-Day Model Outlook
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2 scrollbar-thin">
                  {explorerData.forecast.daily.slice(0, 7).map((day, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-xs">
                      <div className="flex items-center gap-2">
                        <AnimatedWeatherIllustration condition={day.condition} className="w-8 h-8" />
                        <div>
                          <div className="font-bold text-slate-200">
                            {new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <span className="text-[10px] text-muted-foreground capitalize">{day.condition}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-200">{day.maxTemp.toFixed(0)}&deg; / {day.minTemp.toFixed(0)}&deg;C</div>
                        {day.rainfall > 0 ? (
                          <span className="text-[10px] text-sky-400 font-mono">{day.rainfall.toFixed(1)}mm ({day.rainProbability.toFixed(0)}%)</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">0.0mm</span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

          </div>

          {/* ─── CLIMATE TREND ANALYSIS (LONG TERM METRICS) ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Long term temperature anomaly */}
            <div className="lg:col-span-6">
              <Card className="glass-card border-white/5">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-sky-400">
                      Temperature Anomaly Trends (1994 - 2025)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Variance of yearly average temperatures from baseline models
                    </CardDescription>
                  </div>
                  <div className="text-right font-mono">
                    <span className="block text-xs font-bold text-destructive">+{explorerData.trends.warmingRateDecade.toFixed(2)}&deg;C</span>
                    <span className="text-[9px] text-muted-foreground uppercase">Per Decade</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={explorerData.trends.temperatureAnomalies}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" fontSize={9} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} unit="&deg;C" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)' }}
                        />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
                        <Bar
                          dataKey="anomaly"
                          fill="hsl(var(--destructive))"
                          // Color positive red, negative blue
                          shape={(props: any) => {
                            const { x, y, width, height, payload } = props;
                            const color = payload.anomaly >= 0 ? "hsl(var(--destructive))" : "hsl(var(--primary))";
                            return <rect x={x} y={y} width={width} height={height} fill={color} opacity={0.7} rx={2} />;
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Annual Rainfall Trends */}
            <div className="lg:col-span-6">
              <Card className="glass-card border-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-sky-400">
                    Annual Precipitation Anomaly (1994 - 2025)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Yearly rainfall anomalies representing agricultural water resources shifts
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={explorerData.trends.rainfallTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" fontSize={9} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} unit="mm" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)' }}
                        />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
                        <Bar
                          dataKey="anomaly"
                          fill="hsl(var(--primary))"
                          shape={(props: any) => {
                            const { x, y, width, height, payload } = props;
                            const color = payload.anomaly >= 0 ? "hsl(var(--primary))" : "hsl(var(--chart-4))";
                            return <rect x={x} y={y} width={width} height={height} fill={color} opacity={0.7} rx={2} />;
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* ─── DISASTER RISK INTELLIGENCE ─── */}
          <Card className="glass-card border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                AI Disaster Risk Intelligence & Public Matrix
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time regional hazard predictions and safety guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {explorerData.disasterRisk.activeAlerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No active climate-related hazard warning vectors logged for this location.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {explorerData.disasterRisk.activeAlerts.map((alert, i) => (
                    <Card key={i} className="bg-muted/30 dark:bg-slate-950/40 border border-border/40 flex flex-col justify-between overflow-hidden">
                      <div className={`h-1 w-full ${
                        alert.riskLevel === 'severe' ? 'bg-red-500' :
                        alert.riskLevel === 'high' ? 'bg-orange-500' :
                        alert.riskLevel === 'moderate' ? 'bg-yellow-400' : 'bg-emerald-500'
                      }`} />
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-sm text-foreground capitalize">
                            {alert.hazard.replace("_", " ")} Risk
                          </h4>
                          <Badge variant="outline" className={`text-[9px] font-mono capitalize ${
                            alert.riskLevel === 'severe' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                            alert.riskLevel === 'high' ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' :
                            alert.riskLevel === 'moderate' ? 'border-yellow-400/50 text-yellow-400 bg-yellow-400/10' :
                            'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                          }`}>
                            {alert.riskLevel}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3 text-xs flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-1 text-[10px] text-muted-foreground">
                            <span>Probability</span>
                            <span className="font-mono font-bold text-slate-200">{alert.probability.toFixed(0)}%</span>
                          </div>
                          <Progress value={alert.probability} className="h-1 bg-white/5" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 font-mono text-[10px] border-t border-b border-white/5 py-2">
                          <div>
                            <span className="block text-muted-foreground uppercase text-[8px]">Starts In</span>
                            <span className="font-semibold text-slate-300">
                              {new Date(alert.expectedStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div>
                            <span className="block text-muted-foreground uppercase text-[8px]">Duration</span>
                            <span className="font-semibold text-slate-300">{alert.expectedDuration}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <span className="block text-[10px] font-mono text-muted-foreground uppercase">Precautions</span>
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                            {alert.precautions.slice(0, 2).map((p, k) => <li key={k}>{p}</li>)}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── INTERACTIVE GIS MAP LAYERS WITH SPLIT SCREEN COMPARATOR ─── */}
          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold tracking-wide flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary animate-pulse" />
                  GIS Layer Split Screen Comparator
                </CardTitle>
                <CardDescription className="text-xs">
                  Overlay two GIS climate datasets and drag the slider horizontally to inspect comparison gradients
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-muted/60 dark:bg-slate-950/60 py-1 px-3.5 rounded border border-border/60 text-xs">
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">Left Layer</span>
                  <Select value={gisLayer1} onValueChange={setGisLayer1}>
                    <SelectTrigger className="w-[120px] bg-transparent border-0 h-6 p-0 text-primary text-xs focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="rainfall">Rainfall</SelectItem>
                      <SelectItem value="aqi">AQI Layer</SelectItem>
                      <SelectItem value="humidity">Humidity</SelectItem>
                      <SelectItem value="cloud">Cloud Cover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 bg-muted/60 dark:bg-slate-950/60 py-1 px-3.5 rounded border border-border/60 text-xs">
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">Right Layer</span>
                  <Select value={gisLayer2} onValueChange={setGisLayer2}>
                    <SelectTrigger className="w-[120px] bg-transparent border-0 h-6 p-0 text-indigo-400 text-xs focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="rainfall">Rainfall</SelectItem>
                      <SelectItem value="aqi">AQI Layer</SelectItem>
                      <SelectItem value="humidity">Humidity</SelectItem>
                      <SelectItem value="cloud">Cloud Cover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsFullscreenGis(!isFullscreenGis)}
                  className="w-8 h-8 hover:bg-accent/40 border border-border/60"
                >
                  {isFullscreenGis ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Comparator slider wrapper container */}
              <div
                ref={sliderRef}
                className={`relative w-full overflow-hidden select-none bg-muted/30 dark:bg-slate-950/40 border-t border-border/40 flex items-center justify-center transition-all ${
                  isFullscreenGis ? 'h-[500px]' : 'h-[320px]'
                }`}
                onMouseMove={(e) => { if (isDragging) handleSliderMove(e.clientX); }}
                style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
              >
                
                {/* Left Side Layer */}
                <div className="absolute inset-0 w-full h-full">
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-sky-950/10">
                    {/* Simulated GIS map grid points */}
                    <div className="grid grid-cols-8 gap-4 w-full max-w-lg opacity-40">
                      {Array.from({ length: 32 }).map((_, k) => {
                        const seedVal = (k * 7 + (gisLayer1 === 'temperature' ? 42 : 12)) % 100;
                        return (
                          <div
                            key={k}
                            className="aspect-square rounded-full transition-all duration-300 scale-95"
                            style={{
                              backgroundColor: gisLayer1 === 'temperature'
                                ? `rgba(239, 68, 68, ${seedVal / 100})`
                                : `rgba(14, 165, 233, ${seedVal / 100})`
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side Layer (clippped based on sliderPosition) */}
                <div
                  className="absolute inset-y-0 right-0 h-full"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div
                    className="absolute inset-0 h-full w-full bg-indigo-950/10"
                    style={{
                      width: sliderRef.current?.getBoundingClientRect().width || 0,
                      transform: `translateX(-${sliderPosition}%)`
                    }}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                      <div className="grid grid-cols-8 gap-4 w-full max-w-lg opacity-40">
                        {Array.from({ length: 32 }).map((_, k) => {
                          const seedVal = (k * 13 + (gisLayer2 === 'temperature' ? 42 : 22)) % 100;
                          return (
                            <div
                              key={k}
                              className="aspect-square rounded-full transition-all duration-300 scale-95"
                              style={{
                                backgroundColor: gisLayer2 === 'temperature'
                                  ? `rgba(239, 68, 68, ${seedVal / 100})`
                                  : `rgba(99, 102, 241, ${seedVal / 100})`
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Draggable Divider Line */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-primary z-20 cursor-ew-resize flex items-center justify-center"
                  style={{ left: `${sliderPosition}%` }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="absolute w-8 h-8 rounded-full bg-primary border-4 border-slate-950 flex items-center justify-center shadow-lg cursor-ew-resize">
                    <span className="text-[10px] font-bold text-foreground font-mono">&lt;&gt;</span>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* ─── HISTORICAL EXPLORER (YEAR COMPARISON) ─── */}
          <Card className="glass-card border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold tracking-wide flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Historical Climate Explorer (Year-over-Year)
              </CardTitle>
              <CardDescription className="text-xs">
                Compare monthly averages across historical iterations (2015 vs 2020 vs 2025)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="temperature">
                <TabsList className="bg-muted dark:bg-slate-950 border border-border/60 mb-4">
                  <TabsTrigger value="temperature" className="text-xs">Monthly Temperature</TabsTrigger>
                  <TabsTrigger value="rainfall" className="text-xs">Monthly Rainfall</TabsTrigger>
                </TabsList>
                
                <TabsContent value="temperature">
                  <div className="h-[230px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={
                          // Structure data for multi-line comparison (January to December)
                          Array.from({ length: 12 }).map((_, idx) => {
                            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            const mName = monthNames[idx];
                            const d2015 = explorerData.historical.monthlyAverages.find(d => d.year === 2015 && d.month === mName);
                            const d2020 = explorerData.historical.monthlyAverages.find(d => d.year === 2020 && d.month === mName);
                            const d2025 = explorerData.historical.monthlyAverages.find(d => d.year === 2025 && d.month === mName);
                            return {
                              month: mName,
                              "2015": d2015?.temperature || 0,
                              "2020": d2020?.temperature || 0,
                              "2025": d2025?.temperature || 0,
                            };
                          })
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={9} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} unit="&deg;C" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="2015" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="2020" stroke="hsl(var(--secondary))" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="2025" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="rainfall">
                  <div className="h-[230px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={
                          Array.from({ length: 12 }).map((_, idx) => {
                            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            const mName = monthNames[idx];
                            const d2015 = explorerData.historical.monthlyAverages.find(d => d.year === 2015 && d.month === mName);
                            const d2020 = explorerData.historical.monthlyAverages.find(d => d.year === 2020 && d.month === mName);
                            const d2025 = explorerData.historical.monthlyAverages.find(d => d.year === 2025 && d.month === mName);
                            return {
                              month: mName,
                              "2015": d2015?.rainfall || 0,
                              "2020": d2020?.rainfall || 0,
                              "2025": d2025?.rainfall || 0,
                            };
                          })
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={9} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} unit="mm" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="2015" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="2020" stroke="hsl(var(--secondary))" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="2025" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── SIDE-BY-SIDE COMPARATOR PANE / CABINET ─── */}
      {compareMode && (
        <Card className="glass-card border-indigo-500/20 relative p-6 mt-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1)_0,transparent_60%)] pointer-events-none" />
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/40">
            <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
              <Columns className="w-5 h-5" />
              Side-by-Side Regional Comparison
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-mono uppercase">Compare {selectedCity} vs:</span>
              <Select value={compCity} onValueChange={setCompCity}>
                <SelectTrigger className="w-[180px] bg-muted dark:bg-slate-950 border-border/60 text-indigo-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.filter(l => l.city.toLowerCase() !== selectedCity.toLowerCase()).map(l => (
                    <SelectItem key={l.city} value={l.city}>{l.city} ({l.state})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary city column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <MapPin className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-slate-200">{selectedCity} (Primary)</h4>
              </div>
              
              {explorerData && (
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">Current Temp</span>
                    <span className="font-bold text-slate-200">{explorerData.current.temperature}&deg;C</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">Humidity</span>
                    <span className="font-bold text-slate-200">{explorerData.current.humidity}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">24h Rainfall</span>
                    <span className="font-bold text-slate-200">{explorerData.current.rainfall} mm</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">AQI Level</span>
                    <span className="font-bold text-slate-200">{explorerData.current.aqi}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">Decade Warming Rate</span>
                    <span className="font-bold text-slate-200">+{explorerData.trends.warmingRateDecade.toFixed(2)}&deg;C</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">Forecast Accuracy</span>
                    <span className="font-bold text-slate-200">{explorerData.forecast.forecastAccuracy}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Comparison city column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-slate-200">{compCity}</h4>
              </div>

              {loadingComp ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(n => <Skeleton key={n} className="h-6 w-full rounded bg-white/5" />)}
                </div>
              ) : compData ? (
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">Current Temp</span>
                    <span className={`font-bold ${compData.current.temperature > (explorerData?.current?.temperature || 0) ? 'text-rose-400' : 'text-sky-400'}`}>
                      {compData.current.temperature}&deg;C
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">Humidity</span>
                    <span className="font-bold text-slate-200">{compData.current.humidity}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">24h Rainfall</span>
                    <span className="font-bold text-slate-200">{compData.current.rainfall} mm</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">AQI Level</span>
                    <span className="font-bold text-slate-200">{compData.current.aqi}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">Decade Warming Rate</span>
                    <span className="font-bold text-slate-200">+{compData.trends.warmingRateDecade.toFixed(2)}&deg;C</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-muted-foreground">Forecast Accuracy</span>
                    <span className="font-bold text-slate-200">{compData.forecast.forecastAccuracy}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground py-10 text-center">Failed to load comparator data</div>
              )}
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}
