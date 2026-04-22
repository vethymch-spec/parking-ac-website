/**
 * useSEO — Dynamic SEO & Canonical Tag Manager with Multi-language Support
 * Design: GEO + SEO optimized, updates canonical, title, meta description per page
 * Supports 30 languages with hreflang tags for international SEO
 */
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "@/i18n";
import { buildLocalizedPath, DEFAULT_LANG } from "@/lib/locale";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
}

const BASE_URL = "https://cooldrivepro.com";

// Translated page titles for each language
const PAGE_TITLES: Record<string, Record<string, string>> = {
  "/": {
    en: "Parking Air Conditioner | 12V 24V No-Idle AC – CoolDrivePro",
    "zh-CN": "驻车空调 | 12V 24V 免怠速空调 - CoolDrivePro",
    "zh-TW": "駐車空調 | 12V 24V 免怠速空調 - CoolDrivePro",
    ja: "駐車エアコン | 12V 24V アイドリングストップ対応 - CoolDrivePro",
    ko: "주차 에어컨 | 12V 24V 무공회전 에어컨 - CoolDrivePro",
    de: "Standklimaanlage | 12V 24V Ohne Leerlauf - CoolDrivePro",
    fr: "Climatisation de Stationnement | 12V 24V Sans Ralenti - CoolDrivePro",
    es: "Aire Acondicionado de Estacionamiento | 12V 24V Sin Ralentí - CoolDrivePro",
    it: "Condizionatore per Parcheggio | 12V 24V Senza Minimo - CoolDrivePro",
    pt: "Ar Condicionado de Estacionamento | 12V 24V Sem Marcha Lenta - CoolDrivePro",
    ru: "Стояночный Кондиционер | 12V 24V Без Холостого Хода - CoolDrivePro",
    ar: "مكيف وقوف السيارات | 12V 24V بدون دوران عاكس - CoolDrivePro",
    hi: "पार्किंग एयर कंडीशनर | 12V 24V बिना आइडलिंग - CoolDrivePro",
    th: "เครื่องปรับอากาศจอดรถ | 12V 24V ไม่ต้องติดเครื่องยนต์ - CoolDrivePro",
    vi: "Máy Lạnh Đỗ Xe | 12V 24V Không Cần Nổ Máy - CoolDrivePro",
    id: "AC Parkir | 12V 24V Tanpa Idle - CoolDrivePro",
    tr: "Park Kliması | 12V 24V Rölantisiz - CoolDrivePro",
    pl: "Klimatyzacja Postojowa | 12V 24V Bez Jałowego - CoolDrivePro",
    nl: "Parkeerairconditioning | 12V 24V Zonder Stationair - CoolDrivePro",
    sv: "Parkeringskonditionering | 12V 24V Utan Tomgång - CoolDrivePro",
    no: "Parkering Klimaanlegg | 12V 24V Uten Tomgang - CoolDrivePro",
    da: "Parkeringsklimaanlæg | 12V 24V Uden Tomgang - CoolDrivePro",
    fi: "Pysäköinti-Ilmanvaihto | 12V 24V Ilman Tyhjökäyntiä - CoolDrivePro",
    el: "Κλιματισμός Στάθμευσης | 12V 24V Χωρίς Ρελαντί - CoolDrivePro",
    cs: "Parkovací Klimatizace | 12V 24V Bez Volnoběhu - CoolDrivePro",
    hu: "Parkoló Klíma | 12V 24V Alapjárat Nélkül - CoolDrivePro",
    ro: "Aer Condiționat de Parcare | 12V 24V Fără Ralanti - CoolDrivePro",
    uk: "Стоянковий Кондиціонер | 12V 24V Без Холостого Ходу - CoolDrivePro",
    he: "מזגן חניה | 12V 24V ללא סובב - CoolDrivePro",
    ms: "Penghawa Dingin Parkir | 12V 24V Tanpa Stesen - CoolDrivePro",
  },
  "/contact": {
    en: "Contact CoolDrivePro | Parking AC Support & Sales",
    "zh-CN": "联系 CoolDrivePro | 驻车空调支持与销售",
    "zh-TW": "聯繫 CoolDrivePro | 駐車空調支持與銷售",
    ja: "お問い合わせ | CoolDrivePro 駐車エアコンサポート",
    ko: "문의하기 | CoolDrivePro 주차 에어컨 지원",
    de: "Kontakt | CoolDrivePro Standklimaanlage Support",
    fr: "Contact | CoolDrivePro Support Climatisation",
    es: "Contacto | CoolDrivePro Soporte Aire Acondicionado",
    it: "Contatto | CoolDrivePro Supporto Condizionatore",
    pt: "Contato | CoolDrivePro Suporte Ar Condicionado",
    ru: "Контакты | CoolDrivePro Поддержка Кондиционеров",
    ar: "اتصل بنا | CoolDrivePro دعم مكيف السيارات",
    hi: "संपर्क करें | CoolDrivePro एसी सहायता",
    th: "ติดต่อเรา | CoolDrivePro สนับสนุนเครื่องปรับอากาศ",
    vi: "Liên hệ | CoolDrivePro Hỗ trợ Máy lạnh",
    id: "Hubungi Kami | CoolDrivePro Dukungan AC",
    tr: "İletişim | CoolDrivePro Klima Desteği",
    pl: "Kontakt | CoolDrivePro Wsparcie Klimatyzacji",
    nl: "Contact | CoolDrivePro AC Ondersteuning",
    sv: "Kontakt | CoolDrivePro AC Support",
    no: "Kontakt | CoolDrivePro AC Støtte",
    da: "Kontakt | CoolDrivePro AC Support",
    fi: "Yhteystiedot | CoolDrivePro AC Tuki",
    el: "Επικοινωνία | CoolDrivePro Υποστήριξη Κλιματισμού",
    cs: "Kontakt | CoolDrivePro Podpora Klimatizace",
    hu: "Kapcsolat | CoolDrivePro Klíma Támogatás",
    ro: "Contact | CoolDrivePro Suport AC",
    uk: "Контакти | CoolDrivePro Підтримка Кондиціонерів",
    he: "צור קשר | CoolDrivePro תמיכה במזגן",
    ms: "Hubungi | CoolDrivePro Sokongan AC",
  },
  "/products": {
    en: "Parking AC Products | 12V 24V Truck & RV Air Conditioners – CoolDrivePro",
    "zh-CN": "驻车空调产品 | 12V 24V 卡车和房车空调 - CoolDrivePro",
    "zh-TW": "駐車空調產品 | 12V 24V 卡車和房車空調 - CoolDrivePro",
    ja: "駐車エアコン製品 | 12V 24V トラック・RV用 - CoolDrivePro",
    de: "Standklimaanlagen Produkte | 12V 24V LKW & Wohnmobil - CoolDrivePro",
    fr: "Produits Climatisation | 12V 24V Camion & Camping-car - CoolDrivePro",
    es: "Productos AC Estacionamiento | 12V 24V Camión & RV - CoolDrivePro",
    it: "Prodotti Condizionatore | 12V 24V Camion & Camper - CoolDrivePro",
    pt: "Produtos AC Estacionamento | 12V 24V Caminhão & RV - CoolDrivePro",
    ru: "Продукция Кондиционеров | 12V 24V Грузовик & Дом на Колесах - CoolDrivePro",
    ar: "منتجات مكيف السيارات | 12V 24V شاحنة ومنزل متنقل - CoolDrivePro",
  },
  "/about": {
    en: "About CoolDrivePro | Parking Air Conditioner Experts",
    "zh-CN": "关于 CoolDrivePro | 驻车空调专家",
    "zh-TW": "關於 CoolDrivePro | 駐車空調專家",
    ja: "会社概要 | CoolDrivePro 駐車エアコンの専門家",
    de: "Über CoolDrivePro | Standklimaanlage Experten",
    fr: "À Propos | CoolDrivePro Experts en Climatisation",
    es: "Sobre Nosotros | CoolDrivePro Expertos en AC",
    it: "Chi Siamo | CoolDrivePro Esperti Condizionatori",
    pt: "Sobre Nós | CoolDrivePro Especialistas em AC",
    ru: "О Нас | CoolDrivePro Эксперты по Кондиционерам",
    ar: "عن CoolDrivePro | خبراء مكيف السيارات",
  },
  "/blog": {
    en: "Blog | Parking AC Guides & Tips – CoolDrivePro",
    "zh-CN": "博客 | 驻车空调指南与技巧 - CoolDrivePro",
    "zh-TW": "部落格 | 駐車空調指南與技巧 - CoolDrivePro",
    ja: "ブログ | 駐車エアコンガイドとヒント - CoolDrivePro",
    de: "Blog | Standklimaanlage Ratgeber & Tipps - CoolDrivePro",
    fr: "Blog | Guides & Astuces Climatisation - CoolDrivePro",
    es: "Blog | Guías y Consejos AC Estacionamiento - CoolDrivePro",
    it: "Blog | Guide e Consigli Condizionatore - CoolDrivePro",
    pt: "Blog | Guias e Dicas AC Estacionamento - CoolDrivePro",
    ru: "Блог | Руководства и Советы по Кондиционерам - CoolDrivePro",
    ar: "مدونة | أدلة ونصائح مكيف السيارات - CoolDrivePro",
  },
  "/forum": {
    en: "Community Forum | Parking AC Discussions – CoolDrivePro",
    "zh-CN": "社区论坛 | 驻车空调讨论 - CoolDrivePro",
    "zh-TW": "社區論壇 | 駐車空調討論 - CoolDrivePro",
    ja: "コミュニティフォーラム | 駐車エアコンについての議論 - CoolDrivePro",
    de: "Community-Forum | Diskussionen über Standklimaanlagen - CoolDrivePro",
    fr: "Forum Communautaire | Discussions Climatisation - CoolDrivePro",
    es: "Foro de la Comunidad | Discusiones AC Estacionamiento - CoolDrivePro",
    it: "Forum della Comunità | Discussioni Condizionatore - CoolDrivePro",
    pt: "Fórum da Comunidade | Discussões AC Estacionamento - CoolDrivePro",
    ru: "Форум Сообщества | Обсуждения Кондиционеров - CoolDrivePro",
    ar: "منتدى المجتمع | مناقشات مكيف السيارات - CoolDrivePro",
  },
};

const PAGE_DESCRIPTIONS: Record<string, Record<string, string>> = {
  "/": {
    en: "12V & 24V DC parking AC for trucks, RVs & vans. 10000–12000 BTU, no-idle operation. Free US shipping & 1-year warranty.",
    "zh-CN": "适用于卡车、房车和面包车的 12V 和 24V 直流驻车空调。10000-12000 BTU，免怠速运行。美国境内免费配送，1年质保。",
    "zh-TW": "適用於卡車、房車和廂型車的 12V 和 24V 直流駐車空調。10000-12000 BTU，免怠速運行。美國境內免費配送，1年質保。",
    ja: "トラック、RV、バン用の12V・24V DC駐車エアコン。10000-12000 BTU、アイドリングストップ対応。米国本土送料無料、1年保証。",
    de: "12V & 24V DC Standklimaanlage für LKWs, Wohnmobile & Vans. 10000-12000 BTU, Leerlauf-freier Betrieb. Kostenloser Versand in den USA & 1-Jahres-Garantie.",
    fr: "Climatisation 12V et 24V DC pour camions, camping-cars et vans. 10000-12000 BTU, fonctionnement sans ralenti. Livraison gratuite aux États-Unis et garantie d'un an.",
    es: "Aire acondicionado 12V y 24V DC para camiones, RVs y furgonetas. 10000-12000 BTU, funcionamiento sin ralentí. Envío gratuito en EE.UU. y garantía de 1 año.",
    it: "Condizionatore 12V e 24V DC per camion, camper e furgoni. 10000-12000 BTU, funzionamento senza minimo. Spedizione gratuita negli Stati Uniti e garanzia di 1 anno.",
    pt: "Ar condicionado 12V e 24V DC para caminhões, RVs e vans. 10000-12000 BTU, funcionamento sem marcha lenta. Frete grátis nos EUA e garantia de 1 ano.",
    ru: "Стоянковый кондиционер 12V и 24V DC для грузовиков, домов на колесах и фургонов. 10000-12000 BTU, работа без холостого хода. Бесплатная доставка по США и 1-годичная гарантия.",
    ar: "مكيف وقوف السيارات 12V و 24V DC للشاحنات والمنازل المتنقلة والفانات. 10000-12000 BTU، تشغيل بدون دوران. شحن مجاني في الولايات المتحدة وضمان لمدة سنة.",
  },
};

// Default descriptions for languages not explicitly translated
const DEFAULT_DESCRIPTION = PAGE_DESCRIPTIONS["/"]["en"];

export function useSEO(overrides?: SEOProps) {
  const [location] = useLocation();
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  useEffect(() => {
    // `location` from wouter is already relative to <Router base>, i.e. WITHOUT the locale prefix.
    // We use this as the canonical SEO path key.
    const seoPath = location || "/";

    // Get translated title or fallback to English
    const pageTitles = PAGE_TITLES[seoPath] || {};
    const title = overrides?.title || pageTitles[currentLang] || pageTitles['en'] || document.title;

    // Get translated description or fallback
    const pageDescriptions = PAGE_DESCRIPTIONS[seoPath] || {};
    const description = overrides?.description || pageDescriptions[currentLang] || pageDescriptions['en'] || DEFAULT_DESCRIPTION;

    // Determine canonical URL — locale-aware
    const canonicalUrl = overrides?.canonical || `${BASE_URL}${buildLocalizedPath(currentLang, seoPath)}`;

    // Update or create canonical link tag
    let canonicalTag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.rel = "canonical";
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = canonicalUrl;

    // Update or create hreflang tags for multilingual SEO
    let hreflangTags = document.querySelectorAll('link[rel="alternate"][hreflang]');
    hreflangTags.forEach(tag => tag.remove());
    
    // Build locale-prefixed hreflang URLs
    // English (default) uses the bare path, all others use /{lang}/ prefix
    supportedLanguages.forEach(lang => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = lang;
      link.href = `${BASE_URL}${buildLocalizedPath(lang, seoPath)}`;
      document.head.appendChild(link);
    });

    // Add x-default hreflang (points to English / bare path)
    const defaultLink = document.createElement("link");
    defaultLink.rel = "alternate";
    defaultLink.hreflang = "x-default";
    defaultLink.href = `${BASE_URL}${buildLocalizedPath(DEFAULT_LANG, seoPath)}`;
    document.head.appendChild(defaultLink);

    // Update Open Graph URL
    let ogUrlTag = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrlTag) ogUrlTag.content = canonicalUrl;

    // Update title
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = title;
      const twitterTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.content = title;
    }

    // Update meta description
    if (description) {
      const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (metaDesc) metaDesc.content = description;
      const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = description;
      const twitterDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
      if (twitterDesc) twitterDesc.content = description;
    }

    // Update OG image if provided
    if (overrides?.ogImage) {
      const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
      if (ogImage) ogImage.content = overrides.ogImage;
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLang;
    
    // Update dir attribute for RTL languages
    document.documentElement.dir = ['ar', 'he'].includes(currentLang) ? 'rtl' : 'ltr';

    // Inject page-specific JSON-LD structured data
    const existingPageLd = document.querySelector<HTMLScriptElement>('script[data-page-ld]');
    if (existingPageLd) existingPageLd.remove();
    if (overrides?.jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-page-ld", "true");
      script.textContent = JSON.stringify(overrides.jsonLd);
      document.head.appendChild(script);
    }
    
  }, [location, overrides, currentLang]);
}

// Hook to get translated page title
export function usePageTitle(path: string): string {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const pageTitles = PAGE_TITLES[path] || {};
  return pageTitles[currentLang] || pageTitles['en'] || '';
}
