'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Facebook, MessageCircle, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201000000000';
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('مرحباً AI Studio')}`;

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
              متجرك الرائد والأول للحصول على اشتراكات الذكاء الاصطناعي الرسمية بأعلى جودة، وأسرع تفعيل، وأفضل أسعار في العالم العربي.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl glass-card border border-slate-800 flex items-center justify-center text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition-all"
                title="صفحتنا على فيسبوك"
              >
                <Facebook className="w-4.5 h-4.5" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl glass-card border border-slate-800 flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all"
                title="تواصل واتساب"
              >
                <MessageCircle className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider">روابط السريعة</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#hero" className="hover:text-cyan-400 transition-colors">الرئيسية</a></li>
              <li><a href="#products" className="hover:text-cyan-400 transition-colors">عروض الاشتراكات</a></li>
              <li><a href="#why-us" className="hover:text-cyan-400 transition-colors">مميزات الخدمة</a></li>
              <li><a href="#faq" className="hover:text-cyan-400 transition-colors">الأسئلة الشائعة</a></li>
            </ul>
          </div>

          {/* Contact & Admin */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider">الدعم والإدارة</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  تواصل عبر الواتساب
                </a>
              </li>
              <li>
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                  صفحة الفيسبوك الرسمية
                </a>
              </li>
              <li className="pt-2">
                <Link href="/admin" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>دخول لوحة التحكم</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-slate-800/80 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()} AI Studio.</span>
          <span>تصميم وتطوير مستحدث لأفضل أداء على Vercel.</span>
        </div>
      </div>
    </footer>
  );
}
