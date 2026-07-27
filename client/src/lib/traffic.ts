export const isPaidAdTraffic = () => {
  if (typeof window === "undefined") return false;

  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source")?.toLowerCase();
    const utmMedium = params.get("utm_medium")?.toLowerCase();
    const referrer = document.referrer.toLowerCase();

    return (
      params.has("gclid") ||
      params.has("gbraid") ||
      params.has("wbraid") ||
      params.has("msclkid") ||
      utmSource === "google" ||
      utmMedium === "cpc" ||
      utmMedium === "paid" ||
      referrer.includes("googleadservices.com") ||
      referrer.includes("doubleclick.net")
    );
  } catch {
    return false;
  }
};