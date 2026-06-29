import React from "react";
import { useGetRiskPredictions, getGetRiskPredictionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, TrendingUp, TrendingDown, Minus, BrainCircuit } from "lucide-react";

export default function AiPredictions() {
  const { data: risks, isLoading } = useGetRiskPredictions({
    query: { queryKey: getGetRiskPredictionsQueryKey() }
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-secondary" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-destructive";
    if (score >= 50) return "bg-amber-500";
    return "bg-secondary";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 75) return "text-destructive";
    if (score >= 50) return "text-amber-500";
    return "text-secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text">AI Risk Predictions</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">Machine learning threat assessment</p>
        </div>
        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
          <BrainCircuit className="w-4 h-4 mr-2" />
          Models Operational
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
        ) : risks ? (
          Object.entries(risks).map(([key, risk]) => (
            <Card key={key} className="glass-panel border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="capitalize text-lg">{key.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(risk.trend)}
                  </div>
                </div>
                <CardDescription className="font-mono text-xs">AI Confidence: {risk.confidence}%</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center py-4">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
                      <circle 
                        cx="48" cy="48" r="40" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={40 * 2 * Math.PI} 
                        strokeDashoffset={40 * 2 * Math.PI - (risk.score / 100) * 40 * 2 * Math.PI} 
                        className={getScoreTextColor(risk.score)} 
                      />
                    </svg>
                    <div className="absolute text-2xl font-bold font-display">{risk.score}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-mono">High Risk Regions</div>
                  <div className="flex flex-wrap gap-2">
                    {risk.topRegions.map((region: string) => (
                      <Badge key={region} variant="outline" className="bg-background/40 border-border/60 text-foreground font-medium">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>
    </div>
  );
}