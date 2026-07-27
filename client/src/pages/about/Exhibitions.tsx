/**
 * /about/exhibitions — Trade Shows & Global Presence
 * Trust assets: real photos from international parking AC trade shows.
 */
import { Link } from "wouter";
import { ChevronRight, Globe, Users, Megaphone, Calendar } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { AutoplayBackgroundVideo } from "@/components/AutoplayBackgroundVideo";
import { useSEO } from "@/hooks/useSEO";

const photos = [
  { src: "/images/trust/exhibitions/cooldrivepro-trade-show-01.jpg", alt: "CoolDrivePro booth at international parking AC trade show — wide view" },
  { src: "/images/trust/exhibitions/cooldrivepro-trade-show-02.jpg", alt: "CoolDrivePro 12V parking air conditioner on display at trade fair" },
  { src: "/images/trust/exhibitions/cooldrivepro-trade-show-03.jpg", alt: "CoolDrivePro sales team meeting international distributors at exhibition" },
  { src: "/images/trust/exhibitions/cooldrivepro-trade-show-04.jpg", alt: "CoolDrivePro mini-split parking AC live demo on exhibition floor" },
  { src: "/images/trust/exhibitions/cooldrivepro-trade-show-05.jpg", alt: "CoolDrivePro NanoMax 12V DC parking AC unit displayed at expo" },
  { src: "/images/trust/exhibitions/cooldrivepro-trade-show-06.jpg", alt: "CoolDrivePro engineers explaining DC compressor parking AC to buyers" },
  { src: "/images/trust/exhibitions/cooldrivepro-trade-show-07.jpg", alt: "CoolDrivePro distributor partners visiting the booth" },
  { src: "/images/trust/exhibitions/cooldrivepro-trade-show-08.jpg", alt: "CoolDrivePro top-mounted parking air conditioner exhibition display" },
];

const presence = [
  { icon: Globe, title: "5 continents shipped", desc: "Active distribution partners in North America, EU, UK, Australia, Middle East, Southeast Asia and South Africa." },
  { icon: Users, title: "200+ trade visitors / show", desc: "Each year our team hosts hundreds of fleet buyers, installers and brand owners at international expos." },
  { icon: Megaphone, title: "Live product demos", desc: "Working 12V/24V parking AC units on the booth — buyers can hear noise levels and feel airflow before signing PO." },
  { icon: Calendar, title: "Year-round expo calendar", desc: "Canton Fair, Automechanika, IAA Transportation, RVX and regional commercial-vehicle shows." },
];

export default function Exhibitions() {
  useSEO({
    title: "Trade Shows & Global Presence | CoolDrivePro Parking AC",
    description: "Meet CoolDrivePro in person at international trade shows. Real booth photos, live 12V/24V parking AC demos and distributor meetings across North America, Europe, ANZ and the Middle East.",
    canonical: "https://cooldrivepro.com/about/exhibitions/",
    ogImage: "/images/trust/exhibitions/cooldrivepro-trade-show-01.jpg",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "CoolDrivePro Trade Shows & Global Presence",
      "url": "https://cooldrivepro.com/about/exhibitions/",
      "mainEntity": {
        "@type": "Organization",
        "name": "CoolDrivePro",
        "alternateName": "Qingdao Vethy Industrial Co., Ltd.",
        "url": "https://cooldrivepro.com",
        "logo": "https://cooldrivepro.com/logo.png",
        "areaServed": ["North America", "European Union", "United Kingdom", "Australia", "New Zealand", "Middle East", "Southeast Asia", "South Africa"],
        "image": photos.map(p => `https://cooldrivepro.com${p.src}`),
        "sameAs": [
          "https://www.facebook.com/vethyautomotive/",
          "https://www.youtube.com/@vethyparkingcooler",
          "https://github.com/vethymch-spec/cooldrivepro-cdn"
        ],
      },
      "subjectOf": {
        "@type": "ImageGallery",
        "name": "CoolDrivePro trade-show booth photos",
        "description": "Unedited photos of CoolDrivePro 12V/24V parking AC units, booth and team at international commercial-vehicle, RV and aftermarket trade shows.",
        "image": photos.map(p => ({ "@type": "ImageObject", "contentUrl": `https://cooldrivepro.com${p.src}`, "description": p.alt })),
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://cooldrivepro.com/" },
          { "@type": "ListItem", "position": 2, "name": "About", "item": "https://cooldrivepro.com/about/" },
          { "@type": "ListItem", "position": 3, "name": "Trade Shows", "item": "https://cooldrivepro.com/about/exhibitions/" },
        ],
      },
    },
  });

  return (
    <PageLayout>
      <nav className="max-w-[1280px] mx-auto px-4 lg:px-8 py-3 flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={14} />
        <Link href="/about" className="hover:underline">About</Link>
        <ChevronRight size={14} />
        <span style={{ color: "oklch(0.35 0.10 250)" }}>Trade Shows</span>
      </nav>

      <section className="w-full py-20 lg:py-28 relative overflow-hidden" style={{ backgroundColor: "oklch(0.28 0.10 248)" }}>
        {/* Ambient slow-motion exhibitions background video */}
        <AutoplayBackgroundVideo
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/cooldrivepro-exhibitions-hero-bg.mp4"
          poster="/images/trust/exhibitions/cooldrivepro-trade-show-01.jpg"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,18,46,0.85) 0%, rgba(8,18,46,0.65) 55%, rgba(8,18,46,0.35) 100%)",
          }}
        />
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-white/60" style={{ fontFamily: "'Montserrat', sans-serif" }}>Global Presence</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 max-w-3xl leading-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Meet CoolDrivePro at International Trade Shows
          </h1>
          <p className="text-lg text-white/80 max-w-2xl leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            We exhibit at the biggest commercial-vehicle, RV and aftermarket shows in the world. Below are real photos of our booth, our team and our 12V/24V parking AC units running live in front of buyers.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {presence.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl p-6 border" style={{ borderColor: "oklch(0.90 0.02 240)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: "oklch(0.94 0.06 255)" }}>
                  <Icon size={20} style={{ color: "oklch(0.45 0.18 255)" }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: "oklch(0.28 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12" style={{ backgroundColor: "oklch(0.97 0.015 240)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-extrabold mb-3" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            Booth & live-demo gallery
          </h2>
          <p className="text-base mb-10 max-w-3xl" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            Unedited photos taken at our most recent international exhibitions. Need to meet us at an upcoming show? Email <a href="mailto:support@cooldrivepro.com" className="underline" style={{ color: "oklch(0.45 0.18 255)" }}>support@cooldrivepro.com</a>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map(p => (
              <a key={p.src} href={p.src} target="_blank" rel="noopener" className="block rounded-xl overflow-hidden bg-white border" style={{ borderColor: "oklch(0.90 0.02 240)" }}>
                <img src={p.src} alt={p.alt} loading="lazy" className="w-full h-60 object-cover hover:scale-105 transition-transform duration-500" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold mb-4" style={{ color: "oklch(0.25 0.10 250)", fontFamily: "'Montserrat', sans-serif" }}>
            Planning to attend an upcoming expo?
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: "oklch(0.50 0.05 250)", fontFamily: "'Inter', sans-serif" }}>
            Book a 30-minute private meeting with our export team. We will reserve a demo unit, prepare a quote in your currency and walk you through the latest 12V/24V product roadmap.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="px-8 py-3 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90" style={{ backgroundColor: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
              Book a booth meeting
            </Link>
            <Link href="/about/factory" className="px-8 py-3 rounded-lg font-bold text-sm border-2 transition-all hover:bg-gray-50" style={{ borderColor: "oklch(0.45 0.18 255)", color: "oklch(0.45 0.18 255)", fontFamily: "'Montserrat', sans-serif" }}>
              Tour the factory
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
