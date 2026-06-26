import React from "react";
import { useGetAgricultureDashboard, getGetAgricultureDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sprout, Droplets, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Agriculture() {
  const { data: agri, isLoading } = useGetAgricultureDashboard({
    query: { queryKey: getGetAgricultureDashboardQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold neon-text text-secondary">Agriculture Dashboard</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">Crop viability & soil intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-secondary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase">Soil Moisture</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-12 w-full" /> : (
              <div>
                <div className="flex items-end justify-between mb-2">
                  <div className="text-3xl font-display font-bold text-secondary">{agri?.soilMoisture}%</div>
                  <Droplets className="h-6 w-6 text-secondary/50 mb-1" />
                </div>
                <Progress value={agri?.soilMoisture} className="h-2 bg-secondary/20" indicatorClassName="bg-secondary" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase">Crop Stress Index</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-12 w-full" /> : (
              <div>
                <div className="flex items-end justify-between mb-2">
                  <div className="text-3xl font-display font-bold text-amber-500">{agri?.cropStressIndex}/100</div>
                  <Sprout className="h-6 w-6 text-amber-500/50 mb-1" />
                </div>
                <Progress value={agri?.cropStressIndex} className="h-2 bg-amber-500/20" indicatorClassName="bg-amber-500" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase">Rainfall Outlook</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-12 w-full" /> : (
              <div className="h-full flex items-center">
                <div className="text-2xl font-display font-bold text-primary capitalize">{agri?.rainfallOutlook}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle>Crop Suitability</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>Crop</TableHead>
                    <TableHead>Season</TableHead>
                    <TableHead className="text-right">Suitability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agri?.suitableCrops.map(crop => (
                    <TableRow key={crop.crop} className="border-border/50 hover:bg-white/5">
                      <TableCell className="font-medium">{crop.crop}</TableCell>
                      <TableCell className="text-muted-foreground capitalize">{crop.season}</TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-mono ${crop.suitability > 75 ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                          {crop.suitability}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle>Yield Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (
              <div className="space-y-6">
                {agri?.yieldPredictions.map(pred => (
                  <div key={pred.crop} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                    <div>
                      <div className="font-bold">{pred.crop}</div>
                      <div className="text-sm text-muted-foreground">{pred.predictedYield} {pred.unit}</div>
                    </div>
                    <div className={`flex items-center gap-1 font-mono ${pred.changeFromLastYear > 0 ? 'text-secondary' : 'text-destructive'}`}>
                      {pred.changeFromLastYear > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {Math.abs(pred.changeFromLastYear)}%
                    </div>
                  </div>
                ))}
                
                {agri?.sowingAdvisory && (
                  <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <h4 className="text-xs font-bold uppercase text-primary mb-1">Official Advisory</h4>
                    <p className="text-sm text-foreground">{agri.sowingAdvisory}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}