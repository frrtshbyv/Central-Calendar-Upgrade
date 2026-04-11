import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { useAdminMe } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { AdminShell } from "@/components/layout/AdminShell";

// Pages
import Home from "@/pages/Home";
import CountryPage from "@/pages/CountryPage";
import CrossBorderPage from "@/pages/CrossBorderPage";
import CalendarPage from "@/pages/CalendarPage";
import EventDetail from "@/pages/EventDetail";
import About from "@/pages/About";

// Admin Pages
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminEventForm from "@/pages/admin/EventForm";
import AdminArchive from "@/pages/admin/Archive";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedAdminRoute({ component: Component, ...rest }: any) {
  const { data: me, isLoading } = useAdminMe();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Verifying credentials...</div>;
  }

  if (!me?.authenticated) {
    return <Redirect to="/control-room-7f92x/login" />;
  }

  return <Component {...rest} />;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/control-room-7f92x/login">
        <AdminLogin />
      </Route>
      
      <Route path="/control-room-7f92x/*">
        <AdminShell>
          <Switch>
            <Route path="/control-room-7f92x/events">
              <ProtectedAdminRoute component={AdminDashboard} />
            </Route>
            <Route path="/control-room-7f92x/events/new">
              <ProtectedAdminRoute component={AdminEventForm} />
            </Route>
            <Route path="/control-room-7f92x/events/edit/:id">
              <ProtectedAdminRoute component={AdminEventForm} />
            </Route>
            <Route path="/control-room-7f92x/archive">
              <ProtectedAdminRoute component={AdminArchive} />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </AdminShell>
      </Route>

      <Route path="/*">
        <Shell>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/uzbekistan">
              <CountryPage country="uzbekistan" name="Uzbekistan" />
            </Route>
            <Route path="/kazakhstan">
              <CountryPage country="kazakhstan" name="Kazakhstan" />
            </Route>
            <Route path="/kyrgyzstan">
              <CountryPage country="kyrgyzstan" name="Kyrgyzstan" />
            </Route>
            <Route path="/turkmenistan">
              <CountryPage country="turkmenistan" name="Turkmenistan" />
            </Route>
            <Route path="/caspian-region">
              <CountryPage country="caspian-region" name="Caspian Region" />
            </Route>
            <Route path="/cross-border" component={CrossBorderPage} />
            <Route path="/calendar" component={CalendarPage} />
            <Route path="/event/:slug" component={EventDetail} />
            <Route path="/about" component={About} />
            <Route component={NotFound} />
          </Switch>
        </Shell>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
