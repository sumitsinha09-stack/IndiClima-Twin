import React from "react";
import { useGetClimateTrends, getGetClimateTrendsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function Analytics() {
  const { data: tempTrends, isLoading: loadingTemp } = useGetClimateTrends(
    { metric: "temperature" },
    { query: { queryKey: getGetClimateTrendsQueryKey({ metric: "temperature" }) } }
  );

  const { data: rainTrends, isLoading: loadingRain } = useGetClimateTrends(
    { metric: "rainfall" },
    { query: { queryKey: getGetClimateTrendsQueryKey({ metric: "rainfall" }) } }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold neon-text">Climate Analytics</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">30-year historical trends & anomalies</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="glass-panel border-primary/20">
          <CardHeader>
            <CardTitle>Temperature Anomaly Trend (30 Years)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingTemp ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="movingAvg" stroke="hsl(var(--secondary))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-secondary/20">
          <CardHeader>
            <CardTitle>Annual Rainfall Variation</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingRain ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rainTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorRain)" />
                  <defs>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}