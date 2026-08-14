'use client';

import React from 'react';
import { Product } from '@/lib/products';
import { Check, MessageCircle, Sparkles, Cpu, Video, Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { lang, currency, formatPrice, t, settings } = useApp();
  const whatsappNumber = settings.whatsappNumber || '201021510826';

  const formattedPrice = formatPrice(product.price);
  const formattedOriginalPrice = product.originalPrice ? formatPrice(product.originalPrice) : null;

  const translatedPeriod =
    product.billingPeriod === 'شهرياً' || product.billingPeriod === 'monthly'
      ? t.productCard.monthly
      : product.billingPeriod === 'سنوياً' || product.billingPeriod === 'yearly'
      ? t.productCard.yearly
      : product.billingPeriod;

  // WhatsApp Message formatted according to language & selected currency
  const defaultMsg = product.whatsappMsg || (lang === 'ar'
    ? `مرحباً AI Studio، أريد شراء اشتراك [${product.name}] بسعر ${formattedPrice} (${translatedPeriod})`
    : `Hello AI Studio, I would like to subscribe to [${product.name}] for ${formattedPrice} (${translatedPeriod})`);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMsg)}`;

  // Render product graphic
  const renderProductGraphic = () => {
    if (product.imageUrl) {
      return (
        <div className="w-full h-44 rounded-2xl overflow-hidden mb-5 bg-slate-900 border border-slate-800 relative group-hover:border-purple-500/40 transition-colors">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      );
    }

    switch (product.iconType) {
      case 'gemini':
        return (
          <div className="w-full h-44 rounded-2xl mb-5 bg-gradient-to-br from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-500/20 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-cyan-400/50 transition-colors">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-9 h-9 text-white animate-pulse" />
            </div>
            <span className="text-sm font-bold text-cyan-300 tracking-wider">Google Gemini Pro</span>
          </div>
        );

      case 'chatgpt':
        return (
          <div className="w-full h-44 rounded-2xl mb-5 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-purple-950/80 border border-emerald-500/20 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-emerald-400/50 transition-colors">
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-2 group-hover:scale-110 transition-transform">
              <Cpu className="w-9 h-9 text-white" />
            </div>
            <span className="text-sm font-bold text-emerald-300 tracking-wider">ChatGPT Plus (GPT-4o)</span>
          </div>
        );

      case 'capcut':
        return (
          <div className="w-full h-44 rounded-2xl mb-5 bg-gradient-to-br from-pink-950/80 via-slate-900 to-purple-950/80 border border-pink-500/20 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-pink-400/50 transition-colors">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/30 mb-2 group-hover:scale-110 transition-transform">
              <Video className="w-9 h-9 text-white" />
            </div>
            <span className="text-sm font-bold text-pink-300 tracking-wider">CapCut Pro Video Editor</span>
          </div>
        );

      default:
        return (
          <div className="w-full h-44 rounded-2xl mb-5 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/20 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg mb-2">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-bold text-indigo-300">{product.name}</span>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative glass-card rounded-3xl p-6 flex flex-col justify-between glass-card-hover group ${
        product.popular ? 'border-2 border-purple-500/60 shadow-xl shadow-purple-950/40' : 'border border-slate-800'
      }`}
    >
      {/* Popular Badge */}
      {product.badge && (
        <div className={`absolute -top-3.5 ${lang === 'ar' ? 'right-6' : 'left-6'} z-20`}>
          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg flex items-center gap-1.5 border border-white/20">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{product.badge}</span>
          </span>
        </div>
      )}

      <div>
        {/* Banner */}
        {renderProductGraphic()}

        {/* Title & Category */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
            {product.name}
          </h3>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed mb-6">
          {product.description}
        </p>

        {/* Price Tag */}
        <div className="mb-6 pb-6 border-b border-slate-800/80 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white">{formattedPrice}</span>
          {formattedOriginalPrice && (
            <span className="text-sm text-slate-500 line-through">{formattedOriginalPrice}</span>
          )}
          <span className="text-xs text-slate-400 font-medium">/ {translatedPeriod}</span>
        </div>

        {/* Features list */}
        <div className="space-y-3 mb-8">
          <div className="text-xs font-bold text-slate-300 mb-1">{t.productCard.featuresTitle}</div>
          {product.features && product.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
              <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="leading-snug">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buy Button -> WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full btn-whatsapp-glow py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 group/btn"
      >
        <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
        <span>{t.productCard.buyBtn}</span>
      </a>
    </div>
  );
}
