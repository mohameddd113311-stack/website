'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/products';
import { Sparkles, Layers } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { setStoredProducts } from '@/lib/clientStorage';

interface ProductsSectionProps {
  initialProducts: Product[];
}

export default function ProductsSection({ initialProducts }: ProductsSectionProps) {
  const { t } = useApp();
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const syncProductsFromSources = async () => {
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();

      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        const activeOnly = data.products.filter((p: Product) => p.active !== false);
        setProducts(activeOnly);
        setStoredProducts(data.products);
      }
    } catch (err) {
      console.warn("Error syncing products from server:", err);
    }
  };

  useEffect(() => {
    if (Array.isArray(initialProducts) && initialProducts.length > 0) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    syncProductsFromSources();

    const handleUpdate = () => {
      syncProductsFromSources();
    };

    window.addEventListener('ai_studio_data_changed', handleUpdate);
    window.addEventListener('products_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ai_studio_data_changed', handleUpdate);
      window.removeEventListener('products_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <section id="products" className="py-20 relative overflow-hidden grid-bg">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>{t.productsSection.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {t.productsSection.title}{' '}
            <span className="text-gradient">{t.productsSection.titleGradient}</span>
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            {t.productsSection.subtitle}
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
            <span>{t.productsSection.customNote}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
