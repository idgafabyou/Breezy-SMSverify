import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import WalletPage from "@/pages/wallet-page";
import BuyNumberPage from "@/pages/buy-number-page";
import MyNumbersPage from "@/pages/my-numbers-page";
import NumberDetailsPage from "@/pages/number-details-page";
import NotFound from "@/pages/not-found";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        <PrivateRoute component={HomePage} />
      </Route>
      <Route path="/wallet">
        <PrivateRoute component={WalletPage} />
      </Route>
      <Route path="/buy">
        <PrivateRoute component={BuyNumberPage} />
      </Route>
      <Route path="/my-numbers">
        <PrivateRoute component={MyNumbersPage} />
      </Route>
      <Route path="/numbers/:id">
        <PrivateRoute component={NumberDetailsPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
