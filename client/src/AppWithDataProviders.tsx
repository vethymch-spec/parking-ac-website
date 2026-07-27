import App from "./App";
import DataProviders from "./DataProviders";
import "./i18n";

export default function AppWithDataProviders() {
  return (
    <DataProviders>
      <App />
    </DataProviders>
  );
}