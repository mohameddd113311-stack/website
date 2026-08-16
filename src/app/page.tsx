import React from 'react';
import Hero from '@/components/Hero';
import ProductsSection from '@/components/ProductsSection';
import WhyUs from '@/components/WhyUs';
import FAQ from '@/components/FAQ';
import { getProductsAsync } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Fresh products on demand

export default async function HomePage() {
  const products = (await getProductsAsync()).filter(p => p.active !== false);

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <Hero />

      {/* Products Showcase Section */}
      <ProductsSection initialProducts={products} />

      {/* Why Choose Us */}
      <WhyUs />

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
}

