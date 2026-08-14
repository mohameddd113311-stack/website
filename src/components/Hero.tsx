'use client';

import React from 'react';
import { Sparkles, Zap, ShieldCheck, ArrowDown, MessageCircle, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Hero() {
  const { lang, t, settings } = useApp();
  const whatsappNumber = settings.whatsappNumber || '201021510826';
  
  const whatsappMsg = lang === 'ar'
    ? 'مرحباً AI Studio، أريد الاستفسار عن الاشتراكات والخدمات المتاحة'
    : 'Hello AI Studio, I would like to inquire about available subscriptions and services';
    
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <section id="hero" className="relative min-h-[90vh] pt-32 pb-20 flex items-center justify-center overflow-hidden grid-bg">
      
      {/* Dynamic Glowing Radial Backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-500/20 via-purple-600/20 to-pink-500/10 rounded-full blur-[120px] pointer-events-none animate-glow-slow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 left-10 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-purple-500/30 text-purple-300 text-xs font-semibold mb-8 animate-float shadow-lg shadow-purple-900/20">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>{t.hero.badge}</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.2] mb-6">
          {t.hero.titlePart1}{' '}
          <span className="text-gradient block mt-2">{t.hero.titlePart2}</span>
        </h1>

        {/* Description */}
        <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          {t.hero.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#products"
            className="w-full sm:w-auto btn-primary-glow px-8 py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-3 shadow-xl"
          >
            <span>{t.hero.exploreBtn}</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto glass-card border border-emerald-500/40 hover:border-emerald-400 px-8 py-4 rounded-2xl font-bold text-base text-emerald-400 hover:text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-emerald-900/10"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>{t.hero.customRequestBtn}</span>
          </a>
        </div>

        {/* Feature Badges / Trust Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="glass-card p-4 rounded-2xl border border-slate-800/80 flex items-center justify-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              <div className="text-sm font-bold text-white">{t.hero.featureFastTitle}</div>
              <div className="text-xs text-slate-400">{t.hero.featureFastDesc}</div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800/80 flex items-center justify-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              <div className="text-sm font-bold text-white">{t.hero.featureGuaranteeTitle}</div>
              <div className="text-xs text-slate-400">{t.hero.featureGuaranteeDesc}</div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800/80 flex items-center justify-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Star className="w-5 h-5" />
            </div>
            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              <div className="text-sm font-bold text-white">{t.hero.featureSupportTitle}</div>
              <div className="text-xs text-slate-400">{t.hero.featureSupportDesc}</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
