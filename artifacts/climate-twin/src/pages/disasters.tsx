import { useState, useMemo } from "react";
import {
  useGetDetailedAlerts,
  getGetDetailedAlertsQueryKey,
  type DetailedAlert,
  type AffectedArea,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  Thermometer,
  Wind,
  Droplets,
  Flame,
  Mountain,
  Waves,
  Sun,
  CheckCircle,
  Clock,
  ShieldAlert,
  Filter,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DISASTER_ICONS: Record<string, React.ElementType> = {
  flood: Waves,
  cyclone: Wind,
  heatwave: Sun,
  drought: Thermometer,
  "forest-fire": Flame,
  landslide: Mountain,
};

type ImpactLevel = AffectedArea["impactLevel"];

const IMPACT_CONFIG: Record<ImpactLevel, { label: string; dot: string; row: string; badge: string }> = {
  low: {
    label: "Low",
    dot: "bg-emerald-500",
    row: "hover:bg-emerald-500/5",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  moderate: {
    label: "Moderate",
    dot: "bg-yellow-400",
    row: "hover:bg-yellow-400/5",
    badge: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
  },
  high: {
    label: "High",
    dot: "bg-orange-500",
    row: "hover:bg-orange-500/5",
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  },
  severe: {
    label: "Severe",
    dot: "bg-red-500",
    row: "hover:bg-red-500/5",
    badge: "bg-red-500/10 text-red-400 border-red-500/30",
  },
  extreme: {
    label: "Extreme",
    dot: "bg-purple-500",
    row: "hover:bg-purple-500/5",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
};

const SEVERITY_CONFIG: Record<string, { border: string; badge: string; glow: string }> = {
  extreme: {
    border: "border-l-purple-500",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/50",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
  },
  severe: {
    border: "border-l-red-500",
    badge: "bg-red-500/20 text-red-400 border-red-500/50",
    glow: "shadow-[0_0_16px_rgba(239,68,68,0.12)]",
  },
  warning: {
    border: "border-l-amber-500",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/50",
    glow: "",
  },
  watch: {
    border: "border-l-yellow-400",
    badge: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    glow: "",
  },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "CRITICAL", color: "text-red-400" },
  warning: { label: "WARNING", color: "text-amber-400" },
  watch: { label: "WATCH", color: "text-yellow-400" },
  monitoring: { label: "MONITORING", color: "text-blue-400" },
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

// ─── Affected Areas Table ─────────────────────────────────────────────────────

type SortKey = "district" | "impactLevel" | "populationAtRisk" | "expectedStart";
const IMPACT_ORDER: ImpactLevel[] = ["low", "moderate", "high", "severe", "extreme"];

function AffectedAreasTable({ areas, search }: { areas: AffectedArea[]; search: string }) {
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: "impactLevel", asc: false });
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = q
      ? areas.filter(
          (a) =>
            a.state.toLowerCase().includes(q) ||
            a.district.toLowerCase().includes(q) ||
            a.city.toLowerCase().includes(q) ||
            a.primaryRisk.toLowerCase().includes(q)
        )
      : areas;

    return [...list].sort((a, b) => {
      let diff = 0;
      if (sort.key === "impactLevel") {
        diff = IMPACT_ORDER.indexOf(a.impactLevel) - IMPACT_ORDER.indexOf(b.impactLevel);
      } else if (sort.key === "populationAtRisk") {
        diff = a.populationAtRisk - b.populationAtRisk;
      } else if (sort.key === "expectedStart") {
        diff = new Date(a.expectedStart).getTime() - new Date(b.expectedStart).getTime();
      } else {
        diff = a[sort.key].localeCompare(b[sort.key]);
      }
      return sort.asc ? diff : -diff;
    });
  }, [areas, search, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) => s.key === key ? { key, asc: !s.asc } : { key, asc: false });
  }

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    const active = sort.key === k;
    return (
      <button
        onClick={() => toggleSort(k)}
        className={`flex items-center gap-1 text-xs font-mono uppercase tracking-wider transition-colors ${
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        {active ? (sort.asc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
      </button>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm font-mono">
        No matching areas found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/40">
      <table className="w-full text-sm min-w-[800px]">
        <thead>
          <tr className="border-b border-border/40 bg-muted/10">
            <th className="px-4 py-3 text-left">
              <SortBtn k="district" label="District / City" />
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">State</span>
            </th>
            <th className="px-4 py-3 text-left">
              <SortBtn k="impactLevel" label="Impact" />
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Primary Risk</span>
            </th>
            <th className="px-4 py-3 text-right">
              <SortBtn k="populationAtRisk" label="Pop. at Risk" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortBtn k="expectedStart" label="Timeline" />
            </th>
            <th className="px-4 py-3 text-center">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((area, i) => {
            const cfg = IMPACT_CONFIG[area.impactLevel];
            const isOpen = expanded === i;
            return [
              <tr
                key={`row-${i}`}
                className={`border-b border-border/20 transition-colors cursor-pointer ${cfg.row}`}
                onClick={() => setExpanded(isOpen ? null : i)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{area.district}</div>
                  <div className="text-xs text-muted-foreground">{area.city}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{area.state}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${cfg.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-[180px] truncate">
                  {area.primaryRisk}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 text-foreground font-mono">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {fmt(area.populationAtRisk)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs font-mono text-foreground">{fmtDate(area.expectedStart)}</div>
                  <div className="text-xs text-muted-foreground">to {fmtDate(area.expectedEnd)}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 mx-auto text-primary" />
                    : <ChevronDown className="h-4 w-4 mx-auto text-muted-foreground" />}
                </td>
              </tr>,

              isOpen && (
                <tr key={`detail-${i}`} className="border-b border-border/20 bg-background/40">
                  <td colSpan={7} className="px-4 py-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Met parameters */}
                      <div className="space-y-2">
                        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                          Meteorological Parameters
                        </p>
                        {area.estimatedRainfall != null && (
                          <div className="flex items-center gap-2 text-sm">
                            <Droplets className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-muted-foreground">Rainfall:</span>
                            <span className="font-mono text-foreground">{area.estimatedRainfall} mm</span>
                          </div>
                        )}
                        {area.expectedTemperature != null && (
                          <div className="flex items-center gap-2 text-sm">
                            <Thermometer className="h-3.5 w-3.5 text-red-400" />
                            <span className="text-muted-foreground">Temperature:</span>
                            <span className="font-mono text-foreground">{area.expectedTemperature}°C</span>
                          </div>
                        )}
                        {area.windSpeed != null && (
                          <div className="flex items-center gap-2 text-sm">
                            <Wind className="h-3.5 w-3.5 text-cyan-400" />
                            <span className="text-muted-foreground">Wind Speed:</span>
                            <span className="font-mono text-foreground">{area.windSpeed} km/h</span>
                          </div>
                        )}
                        {area.floodProbability != null && (
                          <div className="flex items-center gap-2 text-sm">
                            <Waves className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-muted-foreground">Flood Prob.:</span>
                            <span className="font-mono text-foreground">{area.floodProbability}%</span>
                          </div>
                        )}
                        {area.landslideProbability != null && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mountain className="h-3.5 w-3.5 text-orange-400" />
                            <span className="text-muted-foreground">Landslide Prob.:</span>
                            <span className="font-mono text-foreground">{area.landslideProbability}%</span>
                          </div>
                        )}
                      </div>

                      {/* Impact indicators */}
                      <div className="space-y-2">
                        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                          Impact Assessment
                        </p>
                        {[
                          { label: "Infrastructure Risk", val: area.infrastructureRisk },
                          { label: "Crop Impact", val: area.cropImpact },
                          { label: "Water Resources", val: area.waterResourceImpact },
                        ].map(({ label, val }) => (
                          <div key={label} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                              IMPACT_CONFIG[val as ImpactLevel]?.badge ?? "bg-muted/20 text-muted-foreground border-border/30"
                            }`}>{val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Precautionary measures */}
                      <div>
                        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                          Precautionary Measures
                        </p>
                        <ul className="space-y-1.5">
                          {area.precautionaryMeasures.map((m, mi) => (
                            <li key={mi} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="text-primary mt-0.5 shrink-0">›</span>
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

function AlertCard({ alert }: { alert: DetailedAlert }) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");

  const sc = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.watch;
  const st = STATUS_CONFIG[alert.status] ?? STATUS_CONFIG.monitoring;
  const Icon = DISASTER_ICONS[alert.type] ?? AlertTriangle;

  const states = useMemo(
    () => ["all", ...Array.from(new Set(alert.affectedAreas.map((a) => a.state)))],
    [alert.affectedAreas]
  );

  const filteredAreas = useMemo(() => {
    let list = alert.affectedAreas;
    if (filterState !== "all") list = list.filter((a) => a.state === filterState);
    return list;
  }, [alert.affectedAreas, filterState]);

  const totalPop = alert.affectedAreas.reduce((s, a) => s + a.populationAtRisk, 0);

  return (
    <div
      className={`rounded-xl border border-border/50 border-l-4 bg-card/60 backdrop-blur-sm overflow-hidden ${sc.border} ${sc.glow}`}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Icon + type */}
          <div className="shrink-0 h-12 w-12 rounded-xl bg-background/60 border border-border/40 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded border text-xs font-bold tracking-wider uppercase ${sc.badge}`}>
                {alert.severity}
              </span>
              <span className={`text-xs font-mono font-bold uppercase ${st.color}`}>
                {st.label}
              </span>
              <span className="text-xs font-mono text-muted-foreground uppercase">{alert.type}</span>
            </div>
            <h3 className="text-lg font-bold text-foreground leading-tight">{alert.title}</h3>
            {alert.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{alert.description}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1 shrink-0">
            <div className="text-right">
              <div className="text-3xl font-display font-bold text-primary tabular-nums">{alert.probability}%</div>
              <div className="text-xs font-mono text-muted-foreground">PROBABILITY</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-display font-semibold text-foreground/80 tabular-nums">{alert.confidence}%</div>
              <div className="text-xs font-mono text-muted-foreground">CONFIDENCE</div>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {alert.affectedAreas.length} districts • {states.length - 1} states
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            {fmt(totalPop)} population at risk
          </div>
          {alert.expectedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Expected: {new Date(alert.expectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Issued: {fmtDate(alert.issuedAt)}
          </div>
        </div>

        {/* Actions + expand toggle */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Hide" : "Show"} Affected Areas ({alert.affectedAreas.length})
          </button>

          {/* Recommended actions preview */}
          {!expanded && (
            <div className="flex flex-wrap gap-2">
              {alert.recommendedActions.slice(0, 2).map((a, i) => (
                <span key={i} className="text-xs text-muted-foreground bg-background/40 border border-border/30 rounded px-2 py-1 line-clamp-1 max-w-[220px]">
                  {a}
                </span>
              ))}
              {alert.recommendedActions.length > 2 && (
                <span className="text-xs text-muted-foreground">+{alert.recommendedActions.length - 2} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded: Affected Areas */}
      {expanded && (
        <div className="border-t border-border/40 bg-background/30 p-5 space-y-4">
          {/* Recommended actions */}
          <div className="rounded-xl border border-border/40 bg-card/40 p-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-primary" />
              Recommended Actions
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {alert.recommendedActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Impact legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="text-muted-foreground flex items-center gap-1"><Filter className="h-3 w-3" /> Impact:</span>
            {(Object.entries(IMPACT_CONFIG) as [ImpactLevel, typeof IMPACT_CONFIG[ImpactLevel]][]).map(([k, v]) => (
              <span key={k} className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${v.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
                {v.label}
              </span>
            ))}
          </div>

          {/* Search + filter controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by state, district, city, or risk type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border/50 bg-background/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-border/50 bg-background/60 text-foreground focus:outline-none focus:border-primary/60 transition-colors"
            >
              {states.map((s) => (
                <option key={s} value={s}>{s === "all" ? "All States" : s}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <AffectedAreasTable areas={filteredAreas} search={search} />
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Disasters() {
  const { data: alerts, isLoading } = useGetDetailedAlerts({
    query: { queryKey: getGetDetailedAlertsQueryKey() },
  });

  const [globalSearch, setGlobalSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!alerts) return [];
    const q = globalSearch.toLowerCase();
    return alerts.filter((a) => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (severityFilter !== "all" && a.severity !== severityFilter) return false;
      if (q) {
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchArea = a.affectedAreas.some(
          (ar) =>
            ar.state.toLowerCase().includes(q) ||
            ar.district.toLowerCase().includes(q) ||
            ar.city.toLowerCase().includes(q)
        );
        if (!matchTitle && !matchArea) return false;
      }
      return true;
    });
  }, [alerts, globalSearch, typeFilter, severityFilter]);

  const totalPop = useMemo(
    () => (alerts ?? []).reduce((s, a) => s + a.affectedAreas.reduce((sa, ar) => sa + ar.populationAtRisk, 0), 0),
    [alerts]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Disaster Prediction Module</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">AI-powered early warning with district-level impact assessment</p>
      </div>

      {/* Summary stats */}
      {!isLoading && alerts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active Alerts", val: alerts.length, color: "text-red-400" },
            { label: "Affected Districts", val: alerts.reduce((s, a) => s + a.affectedAreas.length, 0), color: "text-amber-400" },
            { label: "Population at Risk", val: fmt(totalPop), color: "text-orange-400" },
            { label: "States Affected", val: new Set(alerts.flatMap((a) => a.affectedAreas.map((ar) => ar.state))).size, color: "text-yellow-400" },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4">
              <div className={`text-2xl font-display font-bold tabular-nums ${color}`}>{val}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Global search + filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search alerts, states, districts, or cities..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border/50 bg-card/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-border/50 bg-card/60 text-foreground focus:outline-none focus:border-primary/60 transition-colors text-sm"
        >
          {["all", "flood", "cyclone", "heatwave", "drought", "forest-fire", "landslide"].map((t) => (
            <option key={t} value={t}>{t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-border/50 bg-card/60 text-foreground focus:outline-none focus:border-primary/60 transition-colors text-sm"
        >
          {["all", "extreme", "severe", "warning", "watch"].map((s) => (
            <option key={s} value={s}>{s === "all" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Alert list */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <div className="p-12 text-center border border-dashed border-border/50 rounded-xl bg-background/20 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto text-emerald-500 mb-4 opacity-60" />
            <h3 className="text-xl font-bold text-foreground">No Matching Alerts</h3>
            <p className="mt-2 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
