'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, Currency } from '@/lib/translations';

interface AppContextType {
  lang: Language;
  currency: Currency;
  setLang: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  t: typeof translations.ar;
  formatPrice: (usdPrice: string | number) => string;
  getCurrencySymbol: () => string;
  convertPrice: (usdPrice: string | number) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USD_TO_EGP_RATE = 50; // 1 USD = 50 EGP

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');
  const [currency, setCurrencyState] = useState<Currency>('EGP');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read saved preferences from localStorage on mount
    const savedLang = localStorage.getItem('ai_studio_lang') as Language;
    const savedCurrency = localStorage.getItem('ai_studio_currency') as Currency;

    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLangState(savedLang);
    }
    if (savedCurrency && (savedCurrency === 'EGP' || savedCurrency === 'USD')) {
      setCurrencyState(savedCurrency);
    }
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

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const convertPrice = (usdPrice: string | number): number => {
    const num = typeof usdPrice === 'number' ? usdPrice : parseFloat(usdPrice);
    if (isNaN(num)) return 0;
    if (currency === 'EGP') {
      return Math.round(num * USD_TO_EGP_RATE);
    }
    return num;
  };

  const formatPrice = (usdPrice: string | number): string => {
    const num = typeof usdPrice === 'number' ? usdPrice : parseFloat(usdPrice);
    if (isNaN(num)) return String(usdPrice);

    if (currency === 'EGP') {
      const egpAmount = Math.round(num * USD_TO_EGP_RATE);
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
