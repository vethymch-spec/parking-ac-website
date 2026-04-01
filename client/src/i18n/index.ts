import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Country to language mapping for geo-detection
const countryToLanguage: Record<string, string> = {
  // North America
  'US': 'en', 'CA': 'en', 'MX': 'es',
  // Europe
  'GB': 'en', 'DE': 'de', 'FR': 'fr', 'IT': 'it', 'ES': 'es', 'PT': 'pt',
  'NL': 'nl', 'BE': 'nl', 'CH': 'de', 'AT': 'de', 'SE': 'sv', 'NO': 'no',
  'DK': 'da', 'FI': 'fi', 'PL': 'pl', 'CZ': 'cs', 'HU': 'hu', 'RO': 'ro',
  'GR': 'el', 'RU': 'ru', 'UA': 'uk', 'TR': 'tr',
  // Asia
  'CN': 'zh-CN', 'HK': 'zh-TW', 'TW': 'zh-TW', 'JP': 'ja', 'KR': 'ko',
  'TH': 'th', 'VN': 'vi', 'ID': 'id', 'MY': 'ms', 'PH': 'en', 'SG': 'en',
  'IN': 'hi', 'PK': 'en', 'BD': 'en', 'AE': 'ar', 'SA': 'ar', 'IL': 'he',
  // Africa
  'ZA': 'en', 'EG': 'ar', 'NG': 'en', 'KE': 'en', 'GH': 'en', 'MA': 'ar',
  // Oceania
  'AU': 'en', 'NZ': 'en',
  // South America
  'BR': 'pt', 'AR': 'es', 'CL': 'es', 'CO': 'es', 'PE': 'es',
};

// Detect language from IP geolocation using Cloudflare headers
async function detectLanguageFromGeo(): Promise<string | null> {
  try {
    // Try to get country from Cloudflare headers via a simple request
    const response = await fetch('/cdn-cgi/trace', { method: 'GET' });
    if (response.ok) {
      const text = await response.text();
      const match = text.match(/loc=([A-Z]{2})/);
      if (match) {
        const countryCode = match[1];
        const lang = countryToLanguage[countryCode];
        if (lang) {
          console.log(`[i18n] Geo-detected country: ${countryCode}, language: ${lang}`);
          return lang;
        }
      }
    }
  } catch (e) {
    // Silently fail and return null
  }
  return null;
}

// Import all language files
import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import th from './locales/th.json';
import vi from './locales/vi.json';
import id from './locales/id.json';
import tr from './locales/tr.json';
import pl from './locales/pl.json';
import nl from './locales/nl.json';
import sv from './locales/sv.json';
import no from './locales/no.json';
import da from './locales/da.json';
import fi from './locales/fi.json';
import el from './locales/el.json';
import cs from './locales/cs.json';
import hu from './locales/hu.json';
import ro from './locales/ro.json';
import uk from './locales/uk.json';
import he from './locales/he.json';
import ms from './locales/ms.json';

const resources = {
  en: { translation: en },
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
  ja: { translation: ja },
  ko: { translation: ko },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  ar: { translation: ar },
  hi: { translation: hi },
  th: { translation: th },
  vi: { translation: vi },
  id: { translation: id },
  tr: { translation: tr },
  pl: { translation: pl },
  nl: { translation: nl },
  sv: { translation: sv },
  no: { translation: no },
  da: { translation: da },
  fi: { translation: fi },
  el: { translation: el },
  cs: { translation: cs },
  hu: { translation: hu },
  ro: { translation: ro },
  uk: { translation: uk },
  he: { translation: he },
  ms: { translation: ms },
};

// Language display names for the switcher
export const languageNames: Record<string, string> = {
  en: 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  ar: 'العربية',
  hi: 'हिन्दी',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  tr: 'Türkçe',
  pl: 'Polski',
  nl: 'Nederlands',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
  fi: 'Suomi',
  el: 'Ελληνικά',
  cs: 'Čeština',
  hu: 'Magyar',
  ro: 'Română',
  uk: 'Українська',
  he: 'עברית',
  ms: 'Bahasa Melayu',
};

// Supported languages for SEO
export const supportedLanguages = Object.keys(resources);

// Custom language detector that checks geo first
const customLanguageDetector = {
  type: 'languageDetector' as const,
  async: true,
  init: () => {},
  detect: async (callback: (lng: string) => void) => {
    // Priority 1: Check if user has previously selected a language
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && supportedLanguages.includes(savedLang)) {
      callback(savedLang);
      return;
    }

    // Priority 2: Detect from IP geolocation
    const geoLang = await detectLanguageFromGeo();
    if (geoLang && supportedLanguages.includes(geoLang)) {
      callback(geoLang);
      return;
    }

    // Priority 3: Fall back to browser language
    const browserLang = navigator.language;
    if (browserLang) {
      // Check exact match first
      if (supportedLanguages.includes(browserLang)) {
        callback(browserLang);
        return;
      }
      // Check base language (e.g., 'en-US' -> 'en')
      const baseLang = browserLang.split('-')[0];
      if (supportedLanguages.includes(baseLang)) {
        callback(baseLang);
        return;
      }
    }

    // Priority 4: Default to English
    callback('en');
  },
  cacheUserLanguage: (lng: string) => {
    localStorage.setItem('i18nextLng', lng);
  },
};

i18n
  .use(customLanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper function to get current language for SEO
export function getCurrentLanguage(): string {
  return i18n.language || 'en';
}

// Helper to check if language is RTL
export function isRTL(lang: string): boolean {
  return ['ar', 'he'].includes(lang);
}
