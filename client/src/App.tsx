import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { RealTimeProvider } from "@/hooks/use-real-time";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import EventsPage from "@/pages/events-page";
import DefectsPage from "@/pages/defects-page";
import SignalsPage from "@/pages/signals-page";
import ReportsPage from "@/pages/reports-page";
import TeamPage from "@/pages/team-page";
import SettingsPage from "@/pages/settings-page";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/defects" component={DefectsPage} />
      <ProtectedRoute path="/signals" component={SignalsPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/team" component={TeamPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealTimeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </RealTimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
