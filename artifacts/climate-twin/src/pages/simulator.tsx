import React, { useState } from "react";
import { useRunScenario } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Play, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Simulator() {
  const [params, setParams] = useState({
    temperatureChange: 1.5,
    rainfallChange: -10,
    deforestationPercent: 15,
    urbanExpansionPercent: 20,
    seaLevelRise: 0.5,
    carbonEmissionsChange: 10
  });

  const { mutate: runScenario, data: result, isPending } = useRunScenario();

  const handleSimulate = () => {
    runScenario({ data: params });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold neon-text">Scenario Simulator</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">Digital twin parametric modeling</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-panel border-primary/20 lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              Parameters
            </CardTitle>
            <CardDescription>Adjust variables to simulate outcomes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-mono text-muted-foreground">Temp Change (&deg;C)</label>
                <span className="font-bold text-primary">{params.temperatureChange > 0 ? '+' : ''}{params.temperatureChange}</span>
              </div>
              <Slider 
                value={[params.temperatureChange]} 
                min={-5} max={5} step={0.1}
                onValueChange={([v]) => setParams(p => ({...p, temperatureChange: v}))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-mono text-muted-foreground">Rainfall Change (%)</label>
                <span className="font-bold text-primary">{params.rainfallChange > 0 ? '+' : ''}{params.rainfallChange}%</span>
              </div>
              <Slider 
                value={[params.rainfallChange]} 
                min={-50} max={50} step={1}
                onValueChange={([v]) => setParams(p => ({...p, rainfallChange: v}))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-mono text-muted-foreground">Deforestation (%)</label>
                <span className="font-bold text-primary">{params.deforestationPercent}%</span>
              </div>
              <Slider 
                value={[params.deforestationPercent]} 
                min={0} max={50} step={1}
                onValueChange={([v]) => setParams(p => ({...p, deforestationPercent: v}))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-mono text-muted-foreground">Urban Expansion (%)</label>
                <span className="font-bold text-primary">{params.urbanExpansionPercent}%</span>
              </div>
              <Slider 
                value={[params.urbanExpansionPercent]} 
                min={0} max={30} step={1}
                onValueChange={([v]) => setParams(p => ({...p, urbanExpansionPercent: v}))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-mono text-muted-foreground">Sea Level Rise (m)</label>
                <span className="font-bold text-primary">+{params.seaLevelRise}m</span>
              </div>
              <Slider 
                value={[params.seaLevelRise]} 
                min={0} max={2} step={0.1}
                onValueChange={([v]) => setParams(p => ({...p, seaLevelRise: v}))}
              />
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold neon-border mt-4"
              onClick={handleSimulate}
              disabled={isPending}
            >
              {isPending ? <Activity className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {isPending ? "Computing..." : "Run Simulation"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-panel border-secondary/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-secondary neon-text">Simulation Results</CardTitle>
            <CardDescription>Impact on national infrastructure and population</CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !isPending && (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-background/30">
                <Activity className="w-12 h-12 mb-4 opacity-50" />
                <p>Run simulation to view projected outcomes</p>
              </div>
            )}
            
            {isPending && (
              <div className="h-64 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-primary font-mono animate-pulse">Running climate models...</p>
              </div>
            )}

            {result && !isPending && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-mono text-muted-foreground">Flood Risk Index</span>
                      <span className="font-bold text-destructive">{result.floodRisk}/100</span>
                    </div>
                    <Progress value={result.floodRisk} className="h-2 bg-destructive/20" indicatorClassName="bg-destructive" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-mono text-muted-foreground">Drought Risk Index</span>
                      <span className="font-bold text-amber-500">{result.droughtRisk}/100</span>
                    </div>
                    <Progress value={result.droughtRisk} className="h-2 bg-amber-500/20" indicatorClassName="bg-amber-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-mono text-muted-foreground">Heatwave Risk</span>
                      <span className="font-bold text-orange-500">{result.heatwaveRisk}/100</span>
                    </div>
                    <Progress value={result.heatwaveRisk} className="h-2 bg-orange-500/20" indicatorClassName="bg-orange-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-primary/20 bg-background/50 text-center">
                    <div className="text-xs font-mono text-muted-foreground mb-2">Affected Pop.</div>
                    <div className="text-2xl font-bold text-primary">{result.affectedPopulation}M</div>
                  </div>
                  <div className="p-4 rounded-xl border border-secondary/20 bg-background/50 text-center">
                    <div className="text-xs font-mono text-muted-foreground mb-2">Agri Impact</div>
                    <div className="text-2xl font-bold text-secondary">{result.agricultureImpact > 0 ? '+' : ''}{result.agricultureImpact}%</div>
                  </div>
                  <div className="p-4 rounded-xl border border-blue-500/20 bg-background/50 text-center">
                    <div className="text-xs font-mono text-muted-foreground mb-2">Water Avail.</div>
                    <div className="text-2xl font-bold text-blue-500">{result.waterAvailability > 0 ? '+' : ''}{result.waterAvailability}%</div>
                  </div>
                  <div className="p-4 rounded-xl border border-muted/50 bg-background/50 text-center">
                    <div className="text-xs font-mono text-muted-foreground mb-2">Proj. Surface Temp</div>
                    <div className="text-2xl font-bold text-foreground">{result.surfaceTemp}&deg;C</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}