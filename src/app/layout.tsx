import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'AI Studio | متجر اشتراكات الذكاء الاصطناعي - Gemini Pro, ChatGPT Plus, CapCut Pro',
  description: 'المتجر الأول في الوطن العربي لاشتراكات الذكاء الاصطناعي الرسمية (Gemini Pro, ChatGPT Plus, CapCut Pro) بأسرع تفعيل وتواصل مباشر عبر الواتساب.',
  keywords: ['AI Studio', 'اشتراك Gemini Pro', 'اشتراك ChatGPT Plus', 'اشتراك CapCut Pro', 'ذكاء اصطناعي', 'متجر اشتراكات'],
  authors: [{ name: 'AI Studio Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} scroll-smooth`}>
      <body className="font-sans bg-dark-bg text-slate-100 min-h-screen flex flex-col selection:bg-cyan-500 selection:text-black">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
