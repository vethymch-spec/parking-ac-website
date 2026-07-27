// Self-hosted fonts via fontsource – latin subset only
// Critical fonts for first paint (hero title, nav, body text)
import "@fontsource/montserrat/latin-700.css";
import "@fontsource/montserrat/latin-800.css";
import "@fontsource/inter/latin-400.css";
import "./index.css";

const isLandingPath = () => {
  if (typeof window === "undefined") return false;
  return /^\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?landing(?:\/|$)/.test(window.location.pathname);
};

const loadDeferredFonts = () => {
  requestAnimationFrame(() => {
    import("@fontsource/inter/latin-500.css");
    import("@fontsource/montserrat/latin-400.css");
    import("@fontsource/montserrat/latin-600.css");
    import("@fontsource/inter/latin-600.css");
  });
};

const appModule = isLandingPath()
  ? import("./LandingApp")
  : import("./App");

if (!isLandingPath()) {
  loadDeferredFonts();
}

const rootElement = document.getElementById("root")!;

void Promise.all([import("react"), import("react-dom/client"), appModule]).then(
  ([{ createElement }, { createRoot }, { default: App }]) => {
    createRoot(rootElement).render(createElement(App));
  },
);
