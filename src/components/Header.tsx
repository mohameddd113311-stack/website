'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, MessageCircle, Facebook, ShieldCheck, Menu, X, Globe, DollarSign } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, currency, setLang, setCurrency, t, settings } = useApp();

  const whatsappNumber = settings.whatsappNumber || '201021510826';
  const facebookUrl = settings.facebookUrl || 'https://www.facebook.com/share/1NbRrA56uz/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappHeaderUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    lang === 'ar'
      ? 'مرحباً، أود الاستفسار عن اشتراكات الذكاء الاصطناعي في AI Studio'
      : 'Hello, I would like to inquire about AI subscriptions at AI Studio'
  )}`;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3 shadow-lg shadow-black/40' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-purple-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-dark-bg rounded-[10.5px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                AI <span className="text-gradient">Studio</span>
              </span>
              <span className="text-[10px] text-cyan-400/80 tracking-wider font-semibold">{t.nav.subtitle}</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#hero" className="hover:text-cyan-400 transition-colors">{t.nav.home}</a>
            <a href="#products" className="hover:text-cyan-400 transition-colors">{t.nav.products}</a>
            <a href="#why-us" className="hover:text-cyan-400 transition-colors">{t.nav.whyUs}</a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">{t.nav.faq}</a>
          </nav>

          {/* Action Buttons & Selectors */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Currency Selector */}
            <div className="flex items-center p-1 rounded-xl glass-card border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setCurrency('EGP')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  currency === 'EGP'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="الجنيه المصري (EGP)"
              >
                <span>🇪🇬</span>
                <span>EGP</span>
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  currency === 'USD'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="الدولار الأمريكي (USD)"
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>USD</span>
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center p-1 rounded-xl glass-card border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setLang('ar')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  lang === 'ar'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="اللغة العربية (مع الجنيه المصري)"
              >
                <span>عربي</span>
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  lang === 'en'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="English (with USD)"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>EN</span>
              </button>
            </div>

            {/* Facebook Link */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition-all duration-300"
              title={t.nav.facebookPage}
            >
              <Facebook className="w-4 h-4" />
            </a>

            {/* WhatsApp Direct CTA */}
            <a
              href={whatsappHeaderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-glow px-4 py-2.5 rounded-xl font-semibold text-xs text-white flex items-center gap-2 shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.nav.contactUs}</span>
            </a>

            {/* Admin Link */}
            <Link
              href="/admin"
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-purple-400 transition-colors border border-slate-800 rounded-xl hover:border-purple-500/30 flex items-center gap-1.5 shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.nav.admin}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1.5 rounded-xl glass-card text-xs font-bold text-purple-300 border border-slate-800 flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ar' ? 'EN ($)' : 'عربي (ج.م)'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl glass-card text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-5 rounded-2xl glass-card border border-slate-800 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-cyan-400 font-medium py-1.5 border-b border-slate-800/50"
            >
              {t.nav.home}
            </a>
            <a
              href="#products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-cyan-400 font-medium py-1.5 border-b border-slate-800/50"
            >
              {t.nav.products}
            </a>
            <a
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-cyan-400 font-medium py-1.5 border-b border-slate-800/50"
            >
              {t.nav.whyUs}
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-cyan-400 font-medium py-1.5 border-b border-slate-800/50"
            >
              {t.nav.faq}
            </a>

            {/* Mobile Controls for Language and Currency */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-400 font-bold">العملة / Currency</span>
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
                  <button
                    onClick={() => setCurrency('EGP')}
                    className={`flex-1 py-1.5 rounded-lg text-center ${currency === 'EGP' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                  >
                    🇪🇬 EGP
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`flex-1 py-1.5 rounded-lg text-center ${currency === 'USD' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                  >
                    🇺🇸 USD
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-400 font-bold">اللغة / Language</span>
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
                  <button
                    onClick={() => setLang('ar')}
                    className={`flex-1 py-1.5 rounded-lg text-center ${lang === 'ar' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  >
                    عربي
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`flex-1 py-1.5 rounded-lg text-center ${lang === 'en' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <a
                href={whatsappHeaderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-glow px-4 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{t.nav.contactUs}</span>
              </a>

              <div className="flex items-center justify-between gap-3 pt-2">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl glass-card text-slate-300 hover:text-blue-400 flex items-center justify-center gap-2 text-xs"
                >
                  <Facebook className="w-4 h-4" />
                  <span>{t.nav.facebookPage}</span>
                </a>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-purple-400 flex items-center justify-center gap-1.5 text-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.nav.admin}</span>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
