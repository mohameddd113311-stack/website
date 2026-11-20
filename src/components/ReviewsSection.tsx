'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Facebook,
  CheckCircle2,
  ThumbsUp,
  ShieldCheck,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ReviewItem {
  id: number;
  image: string;
  highlight: string;
  author: string;
}

const REVIEWS: ReviewItem[] = [
  {
    id: 1,
    image: '/images/reviews/review-1.png',
    highlight: 'من أفضل الناس اللي اتعاملت معاهم، قمة في الاحترام والمصداقية وسرعة الرد',
    author: 'موسى السواح & إسراء ناجي & بكر سيد',
  },
  {
    id: 2,
    image: '/images/reviews/review-2.png',
    highlight: 'مصداقية عالية، جربت الاشتراك معاهم في جيميني وشات جي بي تي وزي الفل',
    author: 'أحمد رجب & إسلام كمال & أحمد محمد',
  },
  {
    id: 3,
    image: '/images/reviews/review-3.png',
    highlight: 'ثقة جداً وناس محترمة وحل المشاكل فوري وسريع للغاية',
    author: 'West Arc Innovations & مصطفى سرحان & يحيى محمود',
  },
  {
    id: 4,
    image: '/images/reviews/review-4.png',
    highlight: 'تفعيل في أقل من دقيقة وخدمة تحفة.. وأصدق صفحة بأفضل سعر وأعلى تعويض',
    author: 'محمد هشام & El Professeur & سيف حواس',
  },
  {
    id: 5,
    image: '/images/reviews/review-5.png',
    highlight: 'كنت مترددة بالبداية لكن لقيت قمة في المصداقية وسهولة وسرعة في الاشتراك',
    author: 'رانيا إسماعيل & م/ محمد طه & أنطونيوس فارس',
  },
  {
    id: 6,
    image: '/images/reviews/review-6.png',
    highlight: 'الراجل ده كذا حد رشحهولي ولقيت فيه أمانة وذوق ومصداقية واستجابة سريعة جداً',
    author: 'محمد رضا كشك & محمود رزق & منة فوزي',
  },
  {
    id: 7,
    image: '/images/reviews/review-7.png',
    highlight: 'شخص صبور جداً ومصداقية واستقرار عن تجربة وتعامل مريح وسريع ف التنفيذ',
    author: 'Armia Sh & مينا لطف الله & يوسف هيبة',
  },
];

export default function ReviewsSection() {
  const { lang, t, settings } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-slide every 4 seconds unless hovered or modal is open
  useEffect(() => {
    if (isPaused || selectedImage !== null) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, selectedImage]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      // Swiped left
      handleNext();
    } else if (distance < -50) {
      // Swiped right
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage !== null) {
        if (e.key === 'Escape') setSelectedImage(null);
        return;
      }
      if (e.key === 'ArrowRight') handlePrev();
      if (e.key === 'ArrowLeft') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const isArabic = lang === 'ar';
  const facebookUrl = settings.facebookUrl || 'https://www.facebook.com/share/1NbRrA56uz/';

  return (
    <section id="reviews" className="py-24 relative overflow-hidden bg-dark-bg/95">
      {/* Decorative Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-500/10 via-purple-600/10 to-pink-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{isArabic ? 'تقييمات وتجارب حقيقية 100%' : '100% Real Customer Feedback'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
            {isArabic ? (
              <>
                ماذا يقول عملاؤنا عن <span className="text-gradient">AI Studio</span>؟
              </>
            ) : (
              <>
                What Our Clients Say About <span className="text-gradient">AI Studio</span>
              </>
            )}
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            {isArabic
              ? 'فخورون بثقة مئات العملاء في مصر والوطن العربي، تجارب حقيقية وتقييمات موثقة من صفحتنا على فيسبوك نفخر بها دائماً.'
              : 'Proud to have earned the trust of hundreds of clients across Egypt and the Arab world with verified feedback from our official page.'}
          </p>

          {/* Trust Highlights Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="glass-card px-4 py-3 rounded-2xl border border-amber-500/20 flex flex-col items-center text-center">
              <div className="flex items-center gap-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-300 font-bold">{isArabic ? '4.9 / 5 تقييم ممتاز' : '4.9 / 5 Rating'}</span>
            </div>

            <div className="glass-card px-4 py-3 rounded-2xl border border-cyan-500/20 flex flex-col items-center text-center">
              <span className="text-base font-extrabold text-cyan-400">+1,500</span>
              <span className="text-xs text-slate-300">{isArabic ? 'عميل نشط وسعيد' : 'Happy Clients'}</span>
            </div>

            <div className="glass-card px-4 py-3 rounded-2xl border border-emerald-500/20 flex flex-col items-center text-center">
              <div className="flex items-center gap-1 text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold text-emerald-400">{isArabic ? 'ضمان رسمي' : 'Guaranteed'}</span>
              </div>
              <span className="text-xs text-slate-300">{isArabic ? 'طوال مدة الاشتراك' : 'Full Duration'}</span>
            </div>

            <div className="glass-card px-4 py-3 rounded-2xl border border-purple-500/20 flex flex-col items-center text-center">
              <div className="flex items-center gap-1 text-purple-400 mb-1">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs font-bold text-purple-400">{isArabic ? 'مصداقية 100%' : '100% Genuine'}</span>
              </div>
              <span className="text-xs text-slate-300">{isArabic ? 'تفعيل فوري ودعم 24/7' : 'Instant Activation'}</span>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Slides Track */}
          <div className="overflow-hidden py-4 px-2">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(${
                  isArabic ? currentIndex * 100 : -currentIndex * 100
                }%)`,
              }}
            >
              {REVIEWS.map((review, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <div
                    key={review.id}
                    className="w-full shrink-0 px-2 sm:px-4"
                  >
                    <div
                      className={`glass-card rounded-3xl border transition-all duration-500 overflow-hidden shadow-2xl ${
                        isActive
                          ? 'border-cyan-500/50 shadow-cyan-500/10 scale-[1.01]'
                          : 'border-slate-800 opacity-70'
                      }`}
                    >
                      {/* Card Top Bar */}
                      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <Facebook className="w-4 h-4 fill-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-white">
                                {isArabic ? 'تعليقات فيسبوك الموثقة' : 'Verified Facebook Feedback'}
                              </span>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-xs text-slate-400">
                              {review.author}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      {/* Card Review Highlight Quote */}
                      <div className="px-5 py-3.5 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border-b border-slate-800/50">
                        <p className="text-sm sm:text-base font-semibold text-cyan-200 text-center leading-relaxed">
                          "{review.highlight}"
                        </p>
                      </div>

                      {/* Review Screenshot with Zoom Button */}
                      <div
                        onClick={() => setSelectedImage(review.image)}
                        className="relative group cursor-pointer bg-slate-950 flex items-center justify-center overflow-hidden min-h-[380px] sm:min-h-[460px] p-2 sm:p-4"
                      >
                        <div className="relative w-full max-w-[500px] h-[400px] sm:h-[480px]">
                          <Image
                            src={review.image}
                            alt={`رأي عملاء AI Studio - ${review.id}`}
                            fill
                            className="object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 550px"
                            priority={idx === 0}
                          />
                        </div>

                        {/* Hover Overlay with Zoom Icon */}
                        <div className="absolute inset-0 bg-dark-bg/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 text-white backdrop-blur-[2px]">
                          <div className="w-12 h-12 rounded-full bg-cyan-500/80 flex items-center justify-center shadow-lg shadow-cyan-500/30 transform group-hover:scale-110 transition-transform">
                            <ZoomIn className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-sm font-bold text-cyan-300 bg-dark-bg/80 px-3 py-1 rounded-full border border-cyan-500/30">
                            {isArabic ? 'اضغط لتكبير الصورة وقراءة التفاصيل' : 'Click to enlarge and read'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Footer inside card */}
                      <div className="p-3 bg-slate-900/40 text-center text-xs text-slate-400 flex items-center justify-between px-6 border-t border-slate-800/60">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isArabic ? 'اشتراك مفعل بنجاح' : 'Active Subscription'}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {idx + 1} / {REVIEWS.length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            aria-label="Previous Review"
            className="absolute top-1/2 -left-3 sm:-left-6 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl glass-card border border-slate-700/80 hover:border-cyan-500/50 bg-dark-bg/80 text-white hover:text-cyan-400 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-xl shadow-black/60"
          >
            <ChevronRight className={`w-6 h-6 ${isArabic ? '' : 'rotate-180'}`} />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Review"
            className="absolute top-1/2 -right-3 sm:-right-6 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl glass-card border border-slate-700/80 hover:border-cyan-500/50 bg-dark-bg/80 text-white hover:text-cyan-400 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-xl shadow-black/60"
          >
            <ChevronLeft className={`w-6 h-6 ${isArabic ? '' : 'rotate-180'}`} />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {REVIEWS.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  dotIdx === currentIndex
                    ? 'w-8 h-2.5 bg-gradient-to-r from-cyan-400 to-purple-500 shadow-md shadow-cyan-500/40'
                    : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Facebook Page Call-to-action */}
        <div className="mt-14 text-center">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-blue-400/30"
          >
            <Facebook className="w-5 h-5 fill-white" />
            <span>
              {isArabic
                ? 'شاهد المزيد من آراء وتجارب العملاء على صفحتنا الرسمية فيسبوك'
                : 'See More Customer Reviews on Our Official Facebook Page'}
            </span>
          </a>
        </div>

      </div>

      {/* LightBox Full-Screen Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 sm:-right-4 w-10 h-10 rounded-full bg-slate-800 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-lg border border-slate-700"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image Frame */}
            <div className="relative w-full h-[75vh] max-h-[800px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-2 sm:p-4 flex items-center justify-center">
              <Image
                src={selectedImage}
                alt="تقييم عملاء AI Studio بالحجم الكامل"
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 900px"
              />
            </div>

            <p className="mt-3 text-xs sm:text-sm text-slate-400 text-center">
              {isArabic ? 'اضغط خارج الصورة أو على زر (X) للإغلاق' : 'Click outside or (X) to close'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
