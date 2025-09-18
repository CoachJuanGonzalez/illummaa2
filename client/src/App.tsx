import { Switch, Route, useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Model1BRCompact from "@/pages/model-1br-compact";
import Model2BRFamily from "@/pages/model-2br-family";
import Model3BRExecutive from "@/pages/model-3br-executive";
import { analytics } from "./lib/analytics";

function Router() {
  const [location] = useLocation();
  const previousLocation = useRef<string>("");

  // Track SPA route changes for analytics
  useEffect(() => {
    if (previousLocation.current && previousLocation.current !== location) {
      analytics.trackRouteChange(location, previousLocation.current);
    }
    previousLocation.current = location;
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/models/1br-compact" component={Model1BRCompact} />
      <Route path="/models/2br-family" component={Model2BRFamily} />
      <Route path="/models/3br-executive" component={Model3BRExecutive} />
      <Route component={NotFound} />
    </Switch>
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
