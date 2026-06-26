import { RefreshCw } from "lucide-react";
import type { RefreshState } from "@/hooks/use-refresh-manager";

const TOTAL = 60;
const RADIUS = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props extends RefreshState {}

export function RefreshTimer({ secondsLeft, isRefreshing, lastRefreshed, refreshNow }: Props) {
  const progress = secondsLeft / TOTAL;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const label = isRefreshing ? "Refreshing..." : `${mm}:${ss}`;

  return (
    <div className="flex items-center gap-2">
      {/* Timer ring + countdown */}
      <div className="flex items-center gap-2 bg-background/40 border border-border/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
        {/* SVG ring */}
        <div className="relative h-8 w-8 shrink-0">
          <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36" aria-hidden>
            {/* Track */}
            <circle
              cx="18" cy="18" r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-border/40"
            />
            {/* Progress */}
            <circle
              cx="18" cy="18" r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={isRefreshing ? "text-emerald-400 transition-none" : "text-primary transition-[stroke-dashoffset] duration-1000 ease-linear"}
            />
          </svg>
          {/* Spinning icon overlay when refreshing */}
          {isRefreshing && (
            <RefreshCw className="absolute inset-0 m-auto h-3.5 w-3.5 text-emerald-400 animate-spin" />
          )}
        </div>

        {/* Label */}
        <div className="flex flex-col leading-none">
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
            Next Refresh
          </span>
          <span
            className={`text-sm font-mono font-bold tabular-nums transition-colors ${
              isRefreshing
                ? "text-emerald-400"
                : secondsLeft <= 10
                ? "text-amber-400"
                : "text-foreground"
            }`}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Refresh Now button */}
      <button
        onClick={refreshNow}
        disabled={isRefreshing}
        title="Refresh all data now"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all duration-200 ${
          isRefreshing
            ? "border-border/30 text-muted-foreground cursor-not-allowed bg-background/20"
            : "border-primary/50 text-primary bg-primary/10 hover:bg-primary/20 hover:border-primary active:scale-95"
        }`}
      >
        <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
        {isRefreshing ? "Refreshing" : "Refresh Now"}
      </button>

      {/* Last refreshed */}
      {lastRefreshed && !isRefreshing && (
        <span className="hidden xl:block text-[10px] font-mono text-muted-foreground/60 whitespace-nowrap">
          Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      )}
    </div>
  );
}
