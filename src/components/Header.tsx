'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, MessageCircle, Facebook, ShieldCheck, Menu, X } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201000000000';
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappHeaderUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن اشتراكات الذكاء الاصطناعي في AI Studio')}`;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3 shadow-lg shadow-black/40' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-purple-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-dark-bg rounded-[10.5px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                AI <span className="text-gradient">Studio</span>
              </span>
              <span className="text-[10px] text-cyan-400/80 tracking-wider font-semibold">متجر الاشتراكات الذكية</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#hero" className="hover:text-cyan-400 transition-colors">الرئيسية</a>
            <a href="#products" className="hover:text-cyan-400 transition-colors">الاشتراكات</a>
            <a href="#why-us" className="hover:text-cyan-400 transition-colors">لماذا نحن؟</a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">الأسئلة الشائعة</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Facebook Link */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition-all duration-300"
              title="صفحتنا على فيسبوك"
            >
              <Facebook className="w-4 h-4" />
            </a>

            {/* WhatsApp Direct CTA */}
            <a
              href={whatsappHeaderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-glow px-4 py-2.5 rounded-xl font-semibold text-xs text-white flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>تواصل معنا</span>
            </a>

            {/* Admin Link */}
            <Link
              href="/admin"
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-purple-400 transition-colors border border-slate-800 rounded-xl hover:border-purple-500/30 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>الإدارة</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl glass-card text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-5 rounded-2xl glass-card border border-slate-800 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-cyan-400 font-medium py-1.5 border-b border-slate-800/50"
            >
              الرئيسية
            </a>
            <a
              href="#products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-cyan-400 font-medium py-1.5 border-b border-slate-800/50"
            >
              الاشتراكات والأسعار
            </a>
            <a
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-cyan-400 font-medium py-1.5 border-b border-slate-800/50"
            >
              لماذا اختارنا؟
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-cyan-400 font-medium py-1.5 border-b border-slate-800/50"
            >
              الأسئلة الشائعة
            </a>

            <div className="flex flex-col gap-3 pt-2">
              <a
                href={whatsappHeaderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-glow px-4 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>تواصل مباشر عبر الواتساب</span>
              </a>

              <div className="flex items-center justify-between gap-3 pt-2">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl glass-card text-slate-300 hover:text-blue-400 flex items-center justify-center gap-2 text-xs"
                >
                  <Facebook className="w-4 h-4" />
                  <span>صفحتنا على فيسبوك</span>
                </a>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-purple-400 flex items-center justify-center gap-1.5 text-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>الأدمن</span>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
