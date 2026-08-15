'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, Currency } from '@/lib/translations';

export interface SiteSettings {
  whatsappNumber: string;
  facebookUrl: string;
  usdToEgpRate: number;
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

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201021510826',
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/share/1NbRrA56uz/',
  usdToEgpRate: 5, // Default exchange rate: 5 EGP per 1 USD
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
    }
    if (savedCurrency && (savedCurrency === 'EGP' || savedCurrency === 'USD')) {
      setCurrencyState(savedCurrency);
    }

    if (savedSettingsStr) {
      try {
        const parsed = JSON.parse(savedSettingsStr);
        setSettingsState({
          whatsappNumber: parsed.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
          facebookUrl: parsed.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
          usdToEgpRate: parsed.usdToEgpRate ? Number(parsed.usdToEgpRate) : DEFAULT_SETTINGS.usdToEgpRate,
        });
      } catch {}
    }

    // Fetch latest settings from server
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          const newSet: SiteSettings = {
            whatsappNumber: data.settings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
            facebookUrl: data.settings.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
            usdToEgpRate: data.settings.usdToEgpRate ? Number(data.settings.usdToEgpRate) : DEFAULT_SETTINGS.usdToEgpRate,
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

  // Allow setting language without overriding chosen currency unless needed
  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated: SiteSettings = {
      whatsappNumber: newSettings.whatsappNumber ? newSettings.whatsappNumber.trim() : settings.whatsappNumber,
      facebookUrl: newSettings.facebookUrl ? newSettings.facebookUrl.trim() : settings.facebookUrl,
      usdToEgpRate: newSettings.usdToEgpRate !== undefined && !isNaN(Number(newSettings.usdToEgpRate))
        ? Number(newSettings.usdToEgpRate)
        : settings.usdToEgpRate || 5,
    };
    setSettingsState(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_studio_settings', JSON.stringify(updated));
    }
  };

  const currentRate = settings.usdToEgpRate && settings.usdToEgpRate > 0 ? settings.usdToEgpRate : 5;

  const convertPrice = (usdPrice: string | number): number => {
    const num = typeof usdPrice === 'number' ? usdPrice : parseFloat(usdPrice);
    if (isNaN(num)) return 0;
    if (currency === 'EGP') {
      return Math.round(num * currentRate);
    }
    return num;
  };

  const formatPrice = (usdPrice: string | number): string => {
    const num = typeof usdPrice === 'number' ? usdPrice : parseFloat(usdPrice);
    if (isNaN(num)) return String(usdPrice);

    if (currency === 'EGP') {
      const egpAmount = Math.round(num * currentRate);
      return lang === 'ar' ? `${egpAmount} ج.م` : `${egpAmount} EGP`;
    }

    return `$${num}`;
  };

  const getCurrencySymbol = (): string => {
    if (currency === 'EGP') {
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
