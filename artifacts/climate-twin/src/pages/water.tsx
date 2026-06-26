import React from "react";
import { useGetWaterDashboard, getGetWaterDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Water() {
  const { data: water, isLoading } = useGetWaterDashboard({
    query: { queryKey: getGetWaterDashboardQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold neon-text text-blue-400">Water Resources</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">Hydrological reserves & river systems</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel border-blue-500/20">
            <CardHeader>
              <CardTitle>Major Reservoirs</CardTitle>
              <CardDescription>Live storage levels across national dams</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-64 w-full" /> : (
                <div className="space-y-6">
                  {water?.reservoirs.map(res => (
                    <div key={res.name}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <div className="font-bold">{res.name}</div>
                          <div className="text-xs text-muted-foreground">{res.state}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-blue-400 font-bold">{res.fillPercent}%</span>
                          <div className="text-xs text-muted-foreground">{res.currentLevel} / {res.capacity} BCM</div>
                        </div>
                      </div>
                      <Progress 
                        value={res.fillPercent} 
                        className="h-2 bg-blue-950" 
                        indicatorClassName={res.fillPercent < 30 ? "bg-destructive" : "bg-blue-500"} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle>River Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-64 w-full" /> : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead>River System</TableHead>
                      <TableHead>Level (m)</TableHead>
                      <TableHead>Danger (m)</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {water?.rivers.map(river => (
                      <TableRow key={river.name} className="border-border/50 hover:bg-white/5">
                        <TableCell className="font-medium">{river.name}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{river.currentLevel}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{river.dangerLevel}</TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant="outline" 
                            className={
                              river.status === 'danger' || river.status === 'extreme-danger' ? 'bg-destructive/20 text-destructive border-destructive/50' : 
                              river.status === 'warning' ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' : 
                              'bg-secondary/20 text-secondary border-secondary/50'
                            }
                          >
                            {river.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle>Water Stress Index</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              {isLoading ? <Skeleton className="h-32 w-32 rounded-full" /> : (
                <>
                  <div className="text-6xl font-display font-bold text-amber-500 mb-2">{water?.waterStressIndex}</div>
                  <div className="text-sm text-muted-foreground font-mono uppercase tracking-widest">National Average</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle>Groundwater Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-48 w-full" /> : (
                <div className="space-y-4">
                  <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                    <div className="text-sm text-muted-foreground mb-1">National Avg Level</div>
                    <div className="text-2xl font-bold font-mono">{water?.groundwater.nationalAverage}m <span className="text-sm text-muted-foreground font-sans font-normal">below ground</span></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-destructive/10 rounded border border-destructive/20">
                      <div className="text-xl font-bold text-destructive">{water?.groundwater.depleting}</div>
                      <div className="text-[10px] uppercase text-muted-foreground mt-1">Depleting</div>
                    </div>
                    <div className="p-2 bg-primary/10 rounded border border-primary/20">
                      <div className="text-xl font-bold text-primary">{water?.groundwater.stable}</div>
                      <div className="text-[10px] uppercase text-muted-foreground mt-1">Stable</div>
                    </div>
                    <div className="p-2 bg-secondary/10 rounded border border-secondary/20">
                      <div className="text-xl font-bold text-secondary">{water?.groundwater.recharging}</div>
                      <div className="text-[10px] uppercase text-muted-foreground mt-1">Recharging</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}