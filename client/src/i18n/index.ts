import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

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
export const supportedLanguages = Object.keys(languageNames);

type LocaleModule = { default: Record<string, unknown> };

const localeLoaders: Record<string, () => Promise<LocaleModule>> = {
  'zh-CN': () => import('./locales/zh-CN.json'),
  'zh-TW': () => import('./locales/zh-TW.json'),
  ja: () => import('./locales/ja.json'),
  ko: () => import('./locales/ko.json'),
  de: () => import('./locales/de.json'),
  fr: () => import('./locales/fr.json'),
  es: () => import('./locales/es.json'),
  it: () => import('./locales/it.json'),
  pt: () => import('./locales/pt.json'),
  ru: () => import('./locales/ru.json'),
  ar: () => import('./locales/ar.json'),
  hi: () => import('./locales/hi.json'),
  th: () => import('./locales/th.json'),
  vi: () => import('./locales/vi.json'),
  id: () => import('./locales/id.json'),
  tr: () => import('./locales/tr.json'),
  pl: () => import('./locales/pl.json'),
  nl: () => import('./locales/nl.json'),
  sv: () => import('./locales/sv.json'),
  no: () => import('./locales/no.json'),
  da: () => import('./locales/da.json'),
  fi: () => import('./locales/fi.json'),
  el: () => import('./locales/el.json'),
  cs: () => import('./locales/cs.json'),
  hu: () => import('./locales/hu.json'),
  ro: () => import('./locales/ro.json'),
  uk: () => import('./locales/uk.json'),
  he: () => import('./locales/he.json'),
  ms: () => import('./locales/ms.json'),
};

const loadedLanguages = new Set(['en']);

function normalizeLanguage(lang?: string | null): string {
  if (!lang) return 'en';
  if (supportedLanguages.includes(lang)) return lang;

  const baseLang = lang.split('-')[0];
  if (supportedLanguages.includes(baseLang)) return baseLang;

  return 'en';
}

function detectLanguageFromPath(): string | null {
  if (typeof window === 'undefined') return null;

  const match = window.location.pathname.match(/^\/([^/]+)(?:\/|$)/);
  if (!match) return null;

  const segment = match[1];
  return supportedLanguages.includes(segment) && segment !== 'en' ? segment : null;
}

function getInitialLanguage(): string {
  const pathLanguage = detectLanguageFromPath();
  if (pathLanguage) return pathLanguage;

  try {
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang) return normalizeLanguage(savedLang);
  } catch {}

  return 'en';
}

export async function loadLanguageResources(lang: string) {
  const normalizedLanguage = normalizeLanguage(lang);
  if (loadedLanguages.has(normalizedLanguage)) return normalizedLanguage;

  const loader = localeLoaders[normalizedLanguage];
  if (!loader) return 'en';

  const localeModule = await loader();
  i18n.addResourceBundle(normalizedLanguage, 'translation', localeModule.default, true, true);
  loadedLanguages.add(normalizedLanguage);
  return normalizedLanguage;
}

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    partialBundledLanguages: true,
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

if (initialLanguage !== 'en') {
  void loadLanguageResources(initialLanguage).then((loadedLanguage) => {
    void i18n.changeLanguage(loadedLanguage);
  });
}

export default i18n;

// Helper function to get current language for SEO
export function getCurrentLanguage(): string {
  return i18n.language || 'en';
}

// Helper to check if language is RTL
export function isRTL(lang: string): boolean {
  return ['ar', 'he'].includes(lang);
}
