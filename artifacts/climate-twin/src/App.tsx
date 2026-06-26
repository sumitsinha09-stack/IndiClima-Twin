import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import MapPage from "@/pages/map";
import AiPredictions from "@/pages/ai-predictions";
import Simulator from "@/pages/simulator";
import Analytics from "@/pages/analytics";
import Disasters from "@/pages/disasters";
import Agriculture from "@/pages/agriculture";
import Water from "@/pages/water";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: false,
      // Data is considered stale after 55s so the 60s timer always triggers a real fetch
      staleTime: 55_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard"><Layout><Dashboard /></Layout></Route>
      <Route path="/map"><Layout><MapPage /></Layout></Route>
      <Route path="/ai-predictions"><Layout><AiPredictions /></Layout></Route>
      <Route path="/simulator"><Layout><Simulator /></Layout></Route>
      <Route path="/analytics"><Layout><Analytics /></Layout></Route>
      <Route path="/disasters"><Layout><Disasters /></Layout></Route>
      <Route path="/agriculture"><Layout><Agriculture /></Layout></Route>
      <Route path="/water"><Layout><Water /></Layout></Route>
      <Route path="/settings"><Layout><Settings /></Layout></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
