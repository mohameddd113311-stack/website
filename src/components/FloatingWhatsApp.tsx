'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function FloatingWhatsApp() {
  const { lang, t } = useApp();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201000000000';
  
  const whatsappMsg = lang === 'ar'
    ? 'مرحباً، أود التواصل مع فريق دعم AI Studio'
    : 'Hello, I would like to contact AI Studio support team';
    
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 ${lang === 'ar' ? 'left-6' : 'right-6'} z-50 group flex items-center gap-3`}
      title={t.floatingWhatsapp.tooltip}
    >
      <div className="relative">
        <span className="absolute -inset-1 rounded-full bg-emerald-500/50 blur animate-ping pointer-events-none" />
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-950 group-hover:scale-110 transition-transform duration-300">
          <MessageCircle className="w-7 h-7" />
        </div>
      </div>
      <span className="hidden sm:inline-block glass-card px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-300 border border-emerald-500/30 group-hover:border-emerald-400 shadow-xl transition-all">
        {t.floatingWhatsapp.tooltip}
      </span>
    </a>
  );
}
