'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Facebook, MessageCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Footer() {
  const { lang, t, settings } = useApp();
  const whatsappNumber = settings.whatsappNumber || '201021510826';
  const facebookUrl = settings.facebookUrl || 'https://www.facebook.com/share/1NbRrA56uz/';
  
  const whatsappMsg = lang === 'ar'
    ? 'مرحباً AI Studio'
    : 'Hello AI Studio';
    
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <footer className="bg-dark-bg border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px]">
                <div className="w-full h-full bg-dark-bg rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                AI <span className="text-gradient">Studio</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              {t.footer.desc}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl glass-card border border-slate-800 flex items-center justify-center text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition-all"
                title={t.nav.facebookPage}
              >
                <Facebook className="w-4.5 h-4.5" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl glass-card border border-slate-800 flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all"
                title={t.footer.whatsappContact}
              >
                <MessageCircle className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider">{t.footer.quickLinks}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#hero" className="hover:text-cyan-400 transition-colors">{t.nav.home}</a></li>
              <li><a href="#products" className="hover:text-cyan-400 transition-colors">{t.nav.products}</a></li>
              <li><a href="#why-us" className="hover:text-cyan-400 transition-colors">{t.nav.whyUs}</a></li>
              <li><a href="#faq" className="hover:text-cyan-400 transition-colors">{t.nav.faq}</a></li>
            </ul>
          </div>

          {/* Contact & Admin */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider">{t.footer.supportAdmin}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  {t.footer.whatsappContact}
                </a>
              </li>
              <li>
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  {t.footer.fbPage}
                </a>
              </li>
              <li className="pt-2">
                <Link href="/admin" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.footer.adminLogin}</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-slate-800/80 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>{t.footer.copyright.replace('{year}', String(new Date().getFullYear()))}</span>
          <span>{t.footer.designText}</span>
        </div>
      </div>
    </footer>
  );
}
