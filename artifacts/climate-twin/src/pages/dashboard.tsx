import React from "react";
import { 
  useGetCurrentClimate, 
  getGetCurrentClimateQueryKey,
  useGetClimateSummary,
  getGetClimateSummaryQueryKey,
  useGetWeatherForecast,
  getGetWeatherForecastQueryKey,
  useGetRecentAlerts,
  getGetRecentAlertsQueryKey,
  useGetMonsoonStatus,
  getGetMonsoonStatusQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Wind, 
  AlertTriangle, 
  Gauge, 
  Cloud, 
  Activity,
  Calendar,
  CloudLightning,
  Sun,
  CloudFog
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const WeatherIcon = ({ condition, className }: { condition: string, className?: string }) => {
  switch(condition) {
    case 'sunny': return <Sun className={className} />;
    case 'partly-cloudy': return <Cloud className={className} />;
    case 'cloudy': return <Cloud className={className} />;
    case 'rainy': return <CloudRain className={className} />;
    case 'thunderstorm': return <CloudLightning className={className} />;
    case 'foggy': return <CloudFog className={className} />;
    default: return <Sun className={className} />;
  }
};

export default function Dashboard() {
  const { data: currentClimate, isLoading: loadingClimate } = useGetCurrentClimate({
    query: { queryKey: getGetCurrentClimateQueryKey() }
  });
  
  const { data: summary, isLoading: loadingSummary } = useGetClimateSummary({
    query: { queryKey: getGetClimateSummaryQueryKey() }
  });

  const { data: forecast, isLoading: loadingForecast } = useGetWeatherForecast({
    query: { queryKey: getGetWeatherForecastQueryKey() }
  });

  const { data: recentAlerts, isLoading: loadingAlerts } = useGetRecentAlerts({
    query: { queryKey: getGetRecentAlertsQueryKey() }
  });

  const { data: monsoon, isLoading: loadingMonsoon } = useGetMonsoonStatus({
    query: { queryKey: getGetMonsoonStatusQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text">Command Center</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">Live national climate overview</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
            Live Data Feed
          </Badge>
          <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/10">
            {summary?.co2Level || "415"} ppm CO2
          </Badge>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Temp</CardTitle>
            <Thermometer className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingClimate ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-display font-bold text-primary">
                {currentClimate?.temperature.toFixed(1)}&deg;C
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">National average</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rainfall</CardTitle>
            <CloudRain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingClimate ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-display font-bold text-primary">
                {currentClimate?.rainfall.toFixed(1)}<span className="text-xl">mm</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Past 24 hours</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">AQI</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingClimate ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-display font-bold text-primary">
                {currentClimate?.aqi}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Air Quality Index</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Wind</CardTitle>
            <Wind className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingClimate ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-display font-bold text-primary">
                {currentClimate?.windSpeed.toFixed(1)}<span className="text-xl">km/h</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Average speed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts & Warnings */}
        <Card className="glass-panel lg:col-span-1 border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive neon-text">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>Recent critical events</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAlerts ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {recentAlerts?.map((alert) => (
                  <div key={alert.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-destructive">{alert.type}</div>
                      <span className="text-[10px] font-mono text-muted-foreground">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    <div className="text-xs font-mono text-primary mt-2">📍 {alert.region}</div>
                  </div>
                ))}
                {recentAlerts?.length === 0 && (
                  <div className="text-center p-4 text-muted-foreground border border-dashed border-border/50 rounded-lg">
                    No active alerts
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {/* Monsoon Tracker */}
          <Card className="glass-panel border-secondary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-secondary neon-text flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Monsoon Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMonsoon ? <Skeleton className="h-20 w-full" /> : (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-sm text-muted-foreground uppercase tracking-widest font-mono">Current Phase</div>
                      <div className="text-2xl font-bold text-foreground capitalize">{monsoon?.phase}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground uppercase tracking-widest font-mono">Coverage</div>
                      <div className="text-2xl font-bold text-secondary">{monsoon?.currentCoverage}%</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={monsoon?.progressionPercent || 0} className="h-2 bg-secondary/20" indicatorClassName="bg-secondary" />
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                      <span>Onset</span>
                      <span>Progress</span>
                      <span>Withdrawal</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 7-Day Forecast Strip */}
          <Card className="glass-panel border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary neon-text flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                7-Day Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingForecast ? (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-32 w-24 shrink-0" />)}
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {forecast?.map((day) => (
                    <div key={day.date} className="shrink-0 w-24 p-3 rounded-lg border border-primary/10 bg-background/50 flex flex-col items-center justify-between text-center gap-2">
                      <div className="text-xs font-mono text-muted-foreground uppercase">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <WeatherIcon condition={day.condition} className="h-8 w-8 text-primary" />
                      <div className="space-y-1">
                        <div className="text-sm font-bold">{day.maxTemp}&deg;</div>
                        <div className="text-xs text-muted-foreground">{day.minTemp}&deg;</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}