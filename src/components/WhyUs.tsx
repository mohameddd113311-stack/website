'use client';

import React from 'react';
import { ShieldCheck, Zap, Headphones, BadgePercent, Lock, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function WhyUs() {
  const { lang, t } = useApp();

  const icons = [ShieldCheck, Zap, BadgePercent, Headphones, Lock, Clock];
  const colors = [
    { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  ];

  return (
    <section id="why-us" className="py-24 relative overflow-hidden bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold text-cyan-400 tracking-wider uppercase mb-3">
            {t.whyUs.badge}
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            {t.whyUs.mainTitle} <span className="text-gradient">AI Studio</span>؟
          </p>
          <p className="text-slate-400 text-base">
            {t.whyUs.description}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.whyUs.items.map((item, idx) => {
            const Icon = icons[idx % icons.length];
            const theme = colors[idx % colors.length];
            return (
              <div
                key={idx}
                className={`glass-card p-6 rounded-3xl border ${theme.border} hover:border-purple-500/50 transition-all duration-300 group`}
              >
                <div className={`w-12 h-12 rounded-2xl ${theme.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${theme.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
