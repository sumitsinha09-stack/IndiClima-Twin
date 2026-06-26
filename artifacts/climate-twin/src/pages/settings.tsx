import { useState } from "react";
import {
  Bell,
  Database,
  Globe,
  Shield,
  Sliders,
  Wifi,
  CheckCircle,
} from "lucide-react";

const DATA_SOURCES = [
  { id: "imd", name: "IMD Weather API", description: "India Meteorological Department — real-time observations", status: "simulated" },
  { id: "mosdac", name: "MOSDAC / INSAT Satellite", description: "ISRO satellite imagery and derived products", status: "simulated" },
  { id: "nasa", name: "NASA POWER API", description: "NASA meteorological and solar energy data", status: "simulated" },
  { id: "era5", name: "ERA5 Reanalysis", description: "ECMWF global climate reanalysis dataset", status: "simulated" },
  { id: "cwc", name: "CWC — Central Water Commission", description: "River levels, reservoir storage, flood data", status: "simulated" },
  { id: "cpcb", name: "CPCB Air Quality", description: "Central Pollution Control Board AQI stations", status: "simulated" },
  { id: "ndma", name: "NDMA Disaster Registry", description: "National Disaster Management Authority alerts", status: "simulated" },
  { id: "openweather", name: "OpenWeather API", description: "Global weather forecast data", status: "simulated" },
];

const AI_MODELS = [
  { id: "lstm", name: "LSTM Time Series", description: "Long Short-Term Memory model for precipitation forecasting", accuracy: 87.4 },
  { id: "transformer", name: "Transformer Forecast", description: "Attention-based model for temperature and monsoon onset", accuracy: 91.2 },
  { id: "xgboost", name: "XGBoost Ensemble", description: "Gradient boosting for drought and crop yield prediction", accuracy: 84.6 },
  { id: "cnn", name: "CNN Spatial Model", description: "Convolutional neural network for cyclone track prediction", accuracy: 88.9 },
  { id: "prophet", name: "Prophet (Meta)", description: "Decomposable time series model for trend analysis", accuracy: 82.1 },
];

const NOTIFICATION_TYPES = [
  { id: "flood", label: "Flood Warnings" },
  { id: "cyclone", label: "Cyclone Alerts" },
  { id: "heatwave", label: "Heatwave Advisories" },
  { id: "drought", label: "Drought Declarations" },
  { id: "fire", label: "Forest Fire Risk" },
  { id: "landslide", label: "Landslide Warnings" },
];

export default function Settings() {
  const [refreshInterval, setRefreshInterval] = useState(15);
  const [enabledNotifications, setEnabledNotifications] = useState<Set<string>>(
    new Set(["flood", "cyclone", "heatwave"])
  );
  const [savedIndicator, setSavedIndicator] = useState(false);

  function toggleNotification(id: string) {
    setEnabledNotifications((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2500);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">System configuration and data source management</p>
      </div>

      {/* Data Sources */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Data Sources</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DATA_SOURCES.map((src) => (
            <div
              key={src.id}
              className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 flex items-start gap-3"
            >
              <Wifi className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground">{src.name}</span>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    {src.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{src.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Models */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">AI Model Registry</h2>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Model</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground hidden md:table-cell">Purpose</th>
                <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {AI_MODELS.map((model, i) => (
                <tr key={model.id} className={i < AI_MODELS.length - 1 ? "border-b border-border/30" : ""}>
                  <td className="px-4 py-3 font-medium text-foreground">{model.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{model.description}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-primary">{model.accuracy}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notifications */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Alert Notifications</h2>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {NOTIFICATION_TYPES.map((n) => (
            <label key={n.id} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => toggleNotification(n.id)}
                className={`h-5 w-5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  enabledNotifications.has(n.id)
                    ? "bg-primary border-primary"
                    : "border-border/60 bg-background"
                }`}
              >
                {enabledNotifications.has(n.id) && (
                  <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">{n.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* System */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">System</h2>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 space-y-5">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <p className="text-sm font-medium text-foreground">Data Refresh Interval</p>
              <p className="text-xs text-muted-foreground mt-0.5">How often the dashboard polls for new data</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="w-32 accent-blue-500"
              />
              <span className="font-mono text-sm text-primary w-16 text-right">{refreshInterval}s</span>
            </div>
          </div>

          <div className="border-t border-border/30 pt-5 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              GOV-IN-SEC-PROTOCOL: ACTIVE
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              SENSORS ONLINE
            </div>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Save Settings
        </button>
        {savedIndicator && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-400 font-mono">
            <CheckCircle className="h-4 w-4" />
            Saved
          </div>
        )}
      </div>
    </div>
  );
}
