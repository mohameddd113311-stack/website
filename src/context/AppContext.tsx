'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, Currency } from '@/lib/translations';

interface SiteSettings {
  whatsappNumber: string;
  facebookUrl: string;
}

interface AppContextType {
  lang: Language;
  currency: Currency;
  setLang: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  t: typeof translations.ar;
  formatPrice: (usdPrice: string | number) => string;
  getCurrencySymbol: () => string;
  convertPrice: (usdPrice: string | number) => number;
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USD_TO_EGP_RATE = 50; // 1 USD = 50 EGP

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201021510826',
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/share/1NbRrA56uz/',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');
  const [currency, setCurrencyState] = useState<Currency>('EGP');
  const [settings, setSettingsState] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read saved preferences from localStorage on mount
    const savedLang = localStorage.getItem('ai_studio_lang') as Language;
    const savedCurrency = localStorage.getItem('ai_studio_currency') as Currency;
    const savedSettingsStr = localStorage.getItem('ai_studio_settings');

    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLangState(savedLang);
      setCurrencyState(savedLang === 'ar' ? 'EGP' : 'USD');
    }

    if (savedSettingsStr) {
      try {
        const parsed = JSON.parse(savedSettingsStr);
        setSettingsState({
          whatsappNumber: parsed.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
          facebookUrl: parsed.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
        });
      } catch {}
    }

    // Fetch latest settings from server
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          const newSet = {
            whatsappNumber: data.settings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
            facebookUrl: data.settings.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
          };
          setSettingsState(newSet);
          localStorage.setItem('ai_studio_settings', JSON.stringify(newSet));
        }
      })
      .catch(() => {});

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem('ai_studio_lang', lang);
    }
  }, [lang, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('ai_studio_currency', currency);
    }
  }, [currency, mounted]);

  // When changing language, automatically bind currency:
  // Arabic -> EGP (جنيه مصري)
  // English -> USD (دولار)
  const setLang = (newLang: Language) => {
    setLangState(newLang);
    setCurrencyState(newLang === 'ar' ? 'EGP' : 'USD');
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = {
      whatsappNumber: newSettings.whatsappNumber ? newSettings.whatsappNumber.trim() : settings.whatsappNumber,
      facebookUrl: newSettings.facebookUrl ? newSettings.facebookUrl.trim() : settings.facebookUrl,
    };
    setSettingsState(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_studio_settings', JSON.stringify(updated));
    }
  };

  const convertPrice = (usdPrice: string | number): number => {
    const num = typeof usdPrice === 'number' ? usdPrice : parseFloat(usdPrice);
    if (isNaN(num)) return 0;
    if (currency === 'EGP' || lang === 'ar') {
      return Math.round(num * USD_TO_EGP_RATE);
    }
    return num;
  };

  const formatPrice = (usdPrice: string | number): string => {
    const num = typeof usdPrice === 'number' ? usdPrice : parseFloat(usdPrice);
    if (isNaN(num)) return String(usdPrice);

    if (currency === 'EGP' || lang === 'ar') {
      const egpAmount = Math.round(num * USD_TO_EGP_RATE);
      return lang === 'ar' ? `${egpAmount} ج.م` : `${egpAmount} EGP`;
    }

    return `$${num}`;
  };

  const getCurrencySymbol = (): string => {
    if (currency === 'EGP' || lang === 'ar') {
      return lang === 'ar' ? 'ج.م' : 'EGP';
    }
    return '$';
  };

  const currentTranslations = translations[lang] || translations.ar;

  return (
    <AppContext.Provider
      value={{
        lang,
        currency,
        setLang,
        setCurrency,
        t: currentTranslations,
        formatPrice,
        getCurrencySymbol,
        convertPrice,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
