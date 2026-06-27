import React from "react";
import { useGetEnergyDashboard, getGetEnergyDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Zap, Sun, Wind, Droplets, ShieldCheck } from "lucide-react";

export default function EnergyPage() {
  const { data: energy, isLoading } = useGetEnergyDashboard({
    query: { queryKey: getGetEnergyDashboardQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text text-amber-400">Renewable Energy Dashboard</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">Clean energy potential & regional grid viability</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-400/50 text-amber-400 bg-amber-400/10">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Grid Active
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-amber-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Solar Potential
              <Sun className="h-4 w-4 text-amber-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-10 w-3/4" /> : (
              <div>
                <div className="text-3xl font-display font-bold text-amber-400">
                  {energy?.totalSolarPotentialMw.toLocaleString()} <span className="text-sm font-mono font-medium text-muted-foreground">MW</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg. Irradiance: <span className="font-mono text-foreground">{energy?.averageSolarIrradiance}</span> kWh/m²/day
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-cyan-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Wind Potential
              <Wind className="h-4 w-4 text-cyan-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-10 w-3/4" /> : (
              <div>
                <div className="text-3xl font-display font-bold text-cyan-400">
                  {energy?.totalWindPotentialMw.toLocaleString()} <span className="text-sm font-mono font-medium text-muted-foreground">MW</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg. Wind Speed: <span className="font-mono text-foreground">{energy?.averageWindSpeed}</span> m/s
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-blue-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              Hydro Potential
              <Droplets className="h-4 w-4 text-blue-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-10 w-3/4" /> : (
              <div>
                <div className="text-3xl font-display font-bold text-blue-400">
                  {energy?.totalHydroPotentialMw.toLocaleString()} <span className="text-sm font-mono font-medium text-muted-foreground">MW</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total operational reservoir capacity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Table */}
        <Card className="lg:col-span-2 glass-panel border-border/50">
          <CardHeader>
            <CardTitle>Regional Generation Capacities</CardTitle>
            <CardDescription>Estimated potential by state according to current climatic variables</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>State</TableHead>
                    <TableHead>Solar (MW)</TableHead>
                    <TableHead>Wind (MW)</TableHead>
                    <TableHead>Irradiance / Speed</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {energy?.states.map(state => (
                    <TableRow key={state.stateName} className="border-border/50 hover:bg-white/5">
                      <TableCell className="font-medium text-foreground">{state.stateName}</TableCell>
                      <TableCell className="font-mono text-amber-400 font-bold">{state.solarCapacityMw.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-cyan-400 font-bold">{state.windCapacityMw.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {state.solarIrradiance} kWh | {state.windSpeed} m/s
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant="outline" 
                          className={
                            state.status === "optimal" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                            state.status === "high" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" :
                            state.status === "moderate" ? "bg-amber-500/10 text-amber-500 border-amber-500/30" :
                            "bg-destructive/10 text-destructive border-destructive/30"
                          }
                        >
                          {state.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Energy Summary Side Card */}
        <div className="space-y-6">
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle>Grid Integration Index</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Solar Grid Penetration</span>
                  <span className="font-mono text-amber-400">62.4%</span>
                </div>
                <Progress value={62.4} className="h-1.5 bg-amber-950" indicatorClassName="bg-amber-400" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Wind Grid Stability</span>
                  <span className="font-mono text-cyan-400">78.1%</span>
                </div>
                <Progress value={78.1} className="h-1.5 bg-cyan-950" indicatorClassName="bg-cyan-400" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Hydro reserve availability</span>
                  <span className="font-mono text-blue-400">83.5%</span>
                </div>
                <Progress value={83.5} className="h-1.5 bg-blue-950" indicatorClassName="bg-blue-400" />
              </div>

              <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground font-mono space-y-2">
                <div className="flex justify-between">
                  <span>Frequency Stability</span>
                  <span className="text-emerald-400">50.02 Hz (Normal)</span>
                </div>
                <div className="flex justify-between">
                  <span>Forecast Accuracy</span>
                  <span className="text-emerald-400">94.8% (Optimal)</span>
                </div>
                <div className="flex justify-between">
                  <span>Grid Congestion Risk</span>
                  <span className="text-amber-500">Low-Moderate</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
