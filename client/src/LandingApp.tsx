import { Route, Router as WouterRouter, Switch } from "wouter";
import AdLandingPage from "./pages/AdLandingPage";

const getLandingBase = () => {
  if (typeof window === "undefined") return "";
  const match = window.location.pathname.match(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/landing(?:\/|$))/);
  return match?.[0] ?? "";
};

export default function LandingApp() {
  return (
    <WouterRouter base={getLandingBase()}>
      <Switch>
        <Route path="/landing/:slug" component={AdLandingPage} />
        <Route path="/landing/:slug/" component={AdLandingPage} />
        <Route component={AdLandingPage} />
      </Switch>
    </WouterRouter>
  );
}