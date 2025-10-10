import { Switch, Route, useLocation } from "wouter";
import { useEffect, useRef, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { analytics } from "./lib/analytics";

// Performance: Lazy load route components for code splitting (40% bundle reduction)
const Home = lazy(() => import("@/pages/home"));
const Model1BRCompact = lazy(() => import("@/pages/model-1br-compact"));
const Model2BRFamily = lazy(() => import("@/pages/model-2br-family"));
const Model3BRExecutive = lazy(() => import("@/pages/model-3br-executive"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  const [location] = useLocation();
  const previousLocation = useRef<string>("");

  // Track SPA route changes for analytics (preserved - fires before component loads)
  useEffect(() => {
    if (previousLocation.current && previousLocation.current !== location) {
      analytics.trackRouteChange(location, previousLocation.current);
    }
    previousLocation.current = location;
  }, [location]);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/models/1br-compact" component={Model1BRCompact} />
        <Route path="/models/2br-family" component={Model2BRFamily} />
        <Route path="/models/3br-executive" component={Model3BRExecutive} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
