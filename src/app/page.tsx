import React from 'react';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import WhyUs from '@/components/WhyUs';
import FAQ from '@/components/FAQ';
import { getProducts } from '@/lib/products';
import { Sparkles, Layers } from 'lucide-react';

export const revalidate = 0; // Fresh products on demand

export default async function HomePage() {
  const products = getProducts().filter(p => p.active !== false);

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <Hero />

      {/* Products Showcase Section */}
      <section id="products" className="py-20 relative overflow-hidden grid-bg">
        
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>باقتنا المتاحة حالياً</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              اختر خطتك وابدأ في استخدام <span className="text-gradient">الذكاء الاصطناعي</span>
            </h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              جميع الخطط تشمل التفعيل المباشر، ضمان السيرفرات الرسمية، وتواصل سريع عبر الواتساب مع دعم فني متكامل.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Guarantee Footer Note */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass-card border border-purple-500/30 text-slate-300 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>هل تبحث عن خطة مخصصة أو اشتراك آخر غير موجود بالقائمة؟ تواصل معنا وسنوفره لك فوراً!</span>
            </div>
          </div>

        </div>
      </section>

      {/* Why Choose Us */}
      <WhyUs />

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
}
