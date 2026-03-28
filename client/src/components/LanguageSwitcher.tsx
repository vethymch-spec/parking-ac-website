import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { languageNames, supportedLanguages } from '@/i18n';

const GlobeIcon = ({ size = 18, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'footer';
  isScrolled?: boolean;
}

export default function LanguageSwitcher({ variant = 'navbar', isScrolled = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLang = i18n.language || 'en';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
    // Store preference
    localStorage.setItem('i18nextLng', lang);
    // Update HTML lang attribute for SEO
    document.documentElement.lang = lang;
    // Update dir attribute for RTL languages
    document.documentElement.dir = ['ar', 'he'].includes(lang) ? 'rtl' : 'ltr';
  };

  const iconColor = variant === 'navbar' 
    ? (isScrolled ? 'oklch(0.35 0.08 250)' : 'white')
    : 'oklch(0.55 0.05 250)';

  if (variant === 'footer') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors"
          style={{ color: iconColor, fontFamily: "'Inter', sans-serif" }}
        >
          <GlobeIcon size={16} />
          <span>{languageNames[currentLang] || 'English'}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 bg-white shadow-xl rounded-lg py-2 max-h-64 overflow-y-auto w-48 z-50 border border-gray-100">
            {supportedLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors flex items-center justify-between ${
                  currentLang === lang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span>{languageNames[lang]}</span>
                {currentLang === lang && <CheckIcon size={16} />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Navbar variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1"
        aria-label="Change language"
        title="Change language"
      >
        <GlobeIcon size={18} style={{ color: iconColor }} />
        <span className="text-xs font-medium hidden sm:block" style={{ color: iconColor }}>
          {currentLang.toUpperCase()}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-lg py-2 max-h-80 overflow-y-auto w-56 z-50 border border-gray-100">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Select Language</p>
          </div>
          {supportedLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors flex items-center justify-between ${
                currentLang === lang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-8">{lang.toUpperCase()}</span>
                <span>{languageNames[lang]}</span>
              </div>
              {currentLang === lang && <CheckIcon size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
