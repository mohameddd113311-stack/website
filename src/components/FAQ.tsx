'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'كيف يتم تسليم وتفعيل الاشتراك بعد الشراء؟',
      a: 'عند الضغط على زر الشراء، سيتم توجيهك مباشرة إلى تطبيق واتساب مع رسالة جاهزة باسم الاشتراك. بمجرد تأكيد الطلب، سيقوم فريق الدعم بتزويدك ببيانات الحساب والتفعيل فوراً.',
    },
    {
      q: 'هل الاشتراكات رسمية وآمنة على حساباتي؟',
      a: 'نعم 100%! جميع اشتراكاتنا (Gemini Pro, ChatGPT Plus, CapCut Pro) هي اشتراكات رسمية تضمن لك الوصول لجميع الأدوات الممتازة دون أي مخاطر.',
    },
    {
      q: 'ما هي طرق الدفع المتاحة لدى AI Studio؟',
      a: 'نوفر وسائل دفع متعددة وسهلة تناسب الجميع (فودافون كاش، محفظة إلكترونية، تحويل بنكي، USDT، بطاقات ائتمان). يمكنك اختيار طريقة الدفع الأنسب عند التواصل عبر الواتساب.',
    },
    {
      q: 'ماذا أفعل إذا واجهت مشكلة في التفعيل؟',
      a: 'فريق الدعم الفني لدينا متواجد على مدار الساعة. فقط أرسل لنا رسالة على الواتساب وسنستجيب لك في الحال لحل المشكلة أو استبدال الحساب فوراً.',
    },
    {
      q: 'هل يمكنني التجديد شهرياً من نفس الحساب؟',
      a: 'نعم بالتأكيد! يمكنك تجديد اشتراكك شهرياً أو سنوياً بأسعار مميزة من خلال تواصلك معنا مباشرة.',
    },
  ];

  return (
    <section id="faq" className="py-20 relative bg-dark-bg/60 border-t border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>إجابات على تساؤلاتك</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            الأسئلة الشائعة
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-base text-slate-100 hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-400 text-sm leading-relaxed border-t border-slate-800/50 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
