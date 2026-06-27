import React, { useState } from "react";
import { useRunScenario } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Play, Activity, FileDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Simulator() {
  const [params, setParams] = useState({
    temperatureChange: 1.5,
    rainfallChange: -10,
    deforestationPercent: 15,
    urbanExpansionPercent: 20,
    seaLevelRise: 0.5,
    carbonEmissionsChange: 10,
    urbanGreenCoverPercent: 20,
    albedoIndex: 0.2
  });

  const { mutate: runScenario, data: result, isPending } = useRunScenario();

  const handleSimulate = () => {
    runScenario({ data: params });
  };

  const handleDownloadReport = () => {
    const query = new URLSearchParams({
      temperatureChange: params.temperatureChange.toString(),
      rainfallChange: params.rainfallChange.toString(),
      deforestationPercent: params.deforestationPercent.toString(),
      urbanExpansionPercent: params.urbanExpansionPercent.toString(),
      seaLevelRise: params.seaLevelRise.toString(),
      carbonEmissionsChange: params.carbonEmissionsChange.toString(),
    }).toString();
    window.open(`/api/reports/download?${query}`, "_blank");
  };

  const applyPreset = (presetName: string) => {
    if (presetName === "ssp1") {
      setParams({
        temperatureChange: 1.5,
        rainfallChange: 5,
        deforestationPercent: 5,
        urbanExpansionPercent: 10,
        seaLevelRise: 0.2,
        carbonEmissionsChange: -15,
        urbanGreenCoverPercent: 45,
        albedoIndex: 0.6
      });
    } else if (presetName === "ssp2") {
      setParams({
        temperatureChange: 2.2,
        rainfallChange: -5,
        deforestationPercent: 15,
        urbanExpansionPercent: 20,
        seaLevelRise: 0.4,
        carbonEmissionsChange: 20,
        urbanGreenCoverPercent: 25,
        albedoIndex: 0.3
      });
    } else if (presetName === "ssp5") {
      setParams({
        temperatureChange: 4.4,
        rainfallChange: -15,
        deforestationPercent: 35,
        urbanExpansionPercent: 40,
        seaLevelRise: 0.8,
        carbonEmissionsChange: 75,
        urbanGreenCoverPercent: 10,
        albedoIndex: 0.1
      });
    }
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
            {/* Presets Block */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">IPCC Presets</label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="text-[10px] px-1 font-mono hover:bg-primary/10 border-primary/30" onClick={() => applyPreset("ssp1")}>
                  SSP1-2.6
                </Button>
                <Button variant="outline" size="sm" className="text-[10px] px-1 font-mono hover:bg-secondary/10 border-secondary/30" onClick={() => applyPreset("ssp2")}>
                  SSP2-4.5
                </Button>
                <Button variant="outline" size="sm" className="text-[10px] px-1 font-mono hover:bg-destructive/10 border-destructive/30" onClick={() => applyPreset("ssp5")}>
                  SSP5-8.5
                </Button>
              </div>
            </div>

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
                <label className="font-mono text-muted-foreground">Urban Green Cover (%)</label>
                <span className="font-bold text-primary">{params.urbanGreenCoverPercent}%</span>
              </div>
              <Slider 
                value={[params.urbanGreenCoverPercent]} 
                min={0} max={100} step={1}
                onValueChange={([v]) => setParams(p => ({...p, urbanGreenCoverPercent: v}))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-mono text-muted-foreground">Albedo Reflectivity</label>
                <span className="font-bold text-primary">{params.albedoIndex}</span>
              </div>
              <Slider 
                value={[params.albedoIndex]} 
                min={0} max={1} step={0.05}
                onValueChange={([v]) => setParams(p => ({...p, albedoIndex: v}))}
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

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-mono text-muted-foreground">Carbon Emissions Change (%)</label>
                <span className="font-bold text-primary">{params.carbonEmissionsChange > 0 ? '+' : ''}{params.carbonEmissionsChange}%</span>
              </div>
              <Slider 
                value={[params.carbonEmissionsChange]} 
                min={-30} max={100} step={1}
                onValueChange={([v]) => setParams(p => ({...p, carbonEmissionsChange: v}))}
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
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-secondary neon-text">Simulation Results</CardTitle>
              <CardDescription>Impact on national infrastructure and population</CardDescription>
            </div>
            {result && !isPending && (
              <Button 
                variant="outline" 
                onClick={handleDownloadReport} 
                className="text-xs border-primary/50 text-primary bg-primary/10 hover:bg-primary/20 shrink-0 font-mono"
              >
                <FileDown className="w-3.5 h-3.5 mr-1" />
                Export PDF
              </Button>
            )}
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
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-mono text-muted-foreground">Urban Heat Island (UHI) Index</span>
                      <span className="font-bold text-amber-400">{result.uhiIndex}/10</span>
                    </div>
                    <Progress value={result.uhiIndex * 10} className="h-2 bg-amber-400/20" indicatorClassName="bg-amber-400" />
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