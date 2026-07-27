import { buildLocalizedPath, detectLocaleFromPath } from "@/lib/locale";

export type CheckoutProductId = "vs02-pro" | "vx3000sp" | "vth1-dc" | "vth1-110v" | "nano-max";

interface StartCheckoutOptions {
  productId: CheckoutProductId;
  quantity: number;
}

const productNames: Record<CheckoutProductId, string> = {
  "vs02-pro": "VS02 PRO Top-Mounted Parking AC",
  vx3000sp: "VX3000SP Mini Split Parking AC",
  "vth1-dc": "V-TH1 Heating & Cooling Parking AC - 12V/24V DC",
  "vth1-110v": "V-TH1 Heating & Cooling Parking AC - 110V AC",
  "nano-max": "Nano Max Light Truck Parking AC",
};

export async function startCheckout({ productId, quantity }: StartCheckoutOptions) {
  const { lang } = detectLocaleFromPath();
  const contactPath = buildLocalizedPath(lang, "/contact");
  const contactUrl = new URL(contactPath, window.location.origin);
  contactUrl.searchParams.set("intent", "invoice");
  contactUrl.searchParams.set("productId", productId);
  contactUrl.searchParams.set("product", productNames[productId]);
  contactUrl.searchParams.set("quantity", String(quantity));
  contactUrl.searchParams.set("source", "product_request_invoice");

  window.location.assign(`${contactUrl.pathname}${contactUrl.search}`);
}