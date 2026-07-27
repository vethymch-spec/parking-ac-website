/**
 * ApuPage — single dynamic renderer for all /apu/* draft pages.
 * Reads from config.tsx, composes section primitives.
 */
import { useRoute } from "wouter";
import PageLayout from "@/components/PageLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  Hero, PainWall, DiagramSection, HowWorks, ModuleGrid, SolutionMatrix,
  TwoCol, TechCenter, Cases, CompareTable, SpecTable, ResourceHub, FAQ,
  CtaForm, Placeholder, PageNav, Breadcrumb,
} from "./sections";
import { APU_PAGES } from "./config";
import type { Block } from "./config";
import NotFound from "../NotFound";

const BASE = "https://cooldrivepro.com";

export default function ApuPage() {
  const [, params] = useRoute<{ slug?: string }>("/apu/:slug?");
  const [, paramsTrail] = useRoute<{ slug?: string }>("/apu/:slug/");
  const slug = (params?.slug ?? paramsTrail?.slug ?? "").replace(/\/$/, "");
  const config = APU_PAGES[slug];

  // Always-call hook — even if config missing, useSEO must run consistently
  const faqBlock = config?.blocks.find((b) => b.kind === "faq") as
    | { kind: "faq"; items: { q: string; a: string }[] }
    | undefined;
  const graph: any[] = [];
  if (config) {
    graph.push({
      "@type": "WebPage",
      "name": config.title,
      "description": config.description,
      "url": `${BASE}${config.path}`,
      "inLanguage": "en",
    });
    graph.push({
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE}/` },
        { "@type": "ListItem", "position": 2, "name": "APU Solutions", "item": `${BASE}/apu/` },
        ...(slug ? [{ "@type": "ListItem", "position": 3, "name": config.breadcrumb, "item": `${BASE}${config.path}` }] : []),
      ],
    });
    if (faqBlock?.items?.length) {
      graph.push({
        "@type": "FAQPage",
        "mainEntity": faqBlock.items.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      });
    }
  }

  useSEO({
    title: config?.title ?? "APU Solutions | CoolDrivePro",
    description: config?.description ?? "Modular truck APU solutions by CoolDrivePro.",
    canonical: `${BASE}${config?.path ?? "/apu/"}`,
    ogImage: "/images/products/vs02pro-top-mounted.webp",
    jsonLd: config ? { "@context": "https://schema.org", "@graph": graph } : undefined,
  });

  if (!config) return <NotFound />;

  const trail = slug
    ? [{ label: "Home", href: "/" }, { label: "APU Solutions", href: "/apu/" }, { label: config.breadcrumb }]
    : [{ label: "Home", href: "/" }, { label: "APU Solutions" }];

  return (
    <PageLayout>
      <Breadcrumb trail={trail} />
      {config.blocks.map((b, i) => renderBlock(b, i))}
    </PageLayout>
  );
}

function renderBlock(b: Block, key: number) {
  switch (b.kind) {
    case "hero": return <Hero key={key} {...b} />;
    case "painWall": return <PainWall key={key} {...b} />;
    case "diagram": return <DiagramSection key={key} {...b} />;
    case "howWorks": return <HowWorks key={key} {...b} />;
    case "moduleGrid": return <ModuleGrid key={key} {...b} />;
    case "solutionMatrix": return <SolutionMatrix key={key} {...b} />;
    case "twoCol": return <TwoCol key={key} {...b} />;
    case "techCenter": return <TechCenter key={key} {...b} />;
    case "cases": return <Cases key={key} {...b} />;
    case "compareTable": return <CompareTable key={key} {...b} />;
    case "specTable": return <SpecTable key={key} {...b} />;
    case "resourceHub": return <ResourceHub key={key} {...b} />;
    case "faq": return <FAQ key={key} {...b} />;
    case "ctaForm": return <CtaForm key={key} {...b} />;
    case "placeholder": return <Placeholder key={key} {...b} />;
    case "pageNav": return <PageNav key={key} {...b} />;
    default: return null;
  }
}
