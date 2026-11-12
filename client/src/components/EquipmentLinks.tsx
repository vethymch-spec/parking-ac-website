import { detectLocaleFromPath } from "@/lib/locale";

const categories = [
  { name: "Home & outdoor energy storage", href: "/products/energy-storage/", detail: "Compare home battery cabinets and portable power stations." },
  { name: "AC & DC generators", href: "/products/generators/", detail: "Select by output type, rated power and voltage configuration." },
  { name: "Vehicle refrigerators", href: "/products/vehicle-refrigerators/", detail: "Compare compact compressor fridges by capacity and cabinet size." },
];

export default function EquipmentLinks({ guides = false }: { guides?: boolean }) {
  if (detectLocaleFromPath().lang !== "en") return null;

  return (
    <section className="mx-auto my-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 className="mb-4 text-2xl font-bold text-slate-900">{guides ? "Power and refrigeration buying guides" : "Power and vehicle refrigeration"}</h2>
      {guides ? (
        <a className="font-semibold text-blue-800 underline" href="/equipment-guides/">Browse battery, generator and car fridge guides →</a>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {categories.map(({ name, href, detail }) => (
            <a key={href} href={href} className="rounded-xl border border-slate-200 bg-slate-50 p-5 hover:border-blue-700">
              <h3 className="font-bold text-blue-900">{name}</h3>
              <p className="mt-2 text-sm text-slate-700">{detail}</p>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
