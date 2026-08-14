export type Language = 'ar' | 'en';
export type Currency = 'EGP' | 'USD';

export const translations = {
  ar: {
    // Header & Navigation
    nav: {
      home: 'الرئيسية',
      products: 'الاشتراكات والأسعار',
      whyUs: 'لماذا نحن؟',
      faq: 'الأسئلة الشائعة',
      admin: 'الإدارة',
      contactUs: 'تواصل معنا',
      facebookPage: 'صفحتنا على فيسبوك',
      subtitle: 'متجر الاشتراكات الذكية',
    },
    // Hero Section
    hero: {
      badge: 'المتجر الأوثق لاشتراكات الذكاء الاصطناعي والرقمية',
      titlePart1: 'انطلق في عالم الذكاء الاصطناعي مع',
      titlePart2: 'AI Studio',
      description: 'احصل على اشتراكات مدفوعة ومضمونة 100% في Gemini Pro و ChatGPT Plus و CapCut Pro. تفعيل سريع وتواصل مباشر عبر الواتساب بدون تعقيدات!',
      exploreBtn: 'استعرض الخطط والأسعار',
      customRequestBtn: 'طلب خاص عبر الواتساب',
      featureFastTitle: 'تسليم وتفعيل فوري',
      featureFastDesc: 'معالجة سريعة لجميع الطلبات',
      featureGuaranteeTitle: 'ضمان شامل 100%',
      featureGuaranteeDesc: 'حسابات رسمية وموثوقة',
      featureSupportTitle: 'دعم فني 24/7',
      featureSupportDesc: 'خدمة مخصصة على مدار الساعة',
    },
    // Products Section
    productsSection: {
      badge: 'باقتنا المتاحة حالياً',
      title: 'اختر خطتك وابدأ في استخدام',
      titleGradient: 'الذكاء الاصطناعي',
      subtitle: 'جميع الخطط تشمل التفعيل المباشر، ضمان السيرفرات الرسمية، وتواصل سريع عبر الواتساب مع دعم فني متكامل.',
      customNote: 'هل تبحث عن خطة مخصصة أو اشتراك آخر غير موجود بالقائمة؟ تواصل معنا وسنوفره لك فوراً!',
    },
    // Product Card
    productCard: {
      popularBadge: 'الأكثر طلباً 🔥',
      latestBadge: 'النموذج الأحدث',
      creatorBadge: 'صناع المحتوى',
      monthly: 'شهرياً',
      yearly: 'سنوياً',
      buyBtn: 'شراء الآن عبر الواتساب',
      featuresTitle: 'مميزات الاشتراك:',
      defaultMsg: 'مرحباً AI Studio، أريد شراء اشتراك {name} بسعر {price} ({period})',
    },
    // Why Us Section
    whyUs: {
      badge: 'مميزات المتجر',
      mainTitle: 'لماذا يختار الآلاف متجر',
      description: 'نقدم تجربة سلسة وآمنة للحصول على أقوى أدوات الذكاء الاصطناعي والتصميم برسم رسمي وضمان متكامل.',
      items: [
        {
          title: 'اشتراكات رسمية 100%',
          desc: 'نوفر لك حسابات واشتراكات مدفوعة رسمية ومضمونة بدون انقطاع طوال مدة الاشتراك.',
        },
        {
          title: 'تفعيل فوري وخدمة سريعة',
          desc: 'بمجرد تأكيد الطلب عبر الواتساب يتم تسليمك وتفعيل الاشتراك خلال دقائق معدودة.',
        },
        {
          title: 'أفضل أسعار في السوق',
          desc: 'نضمن لك الحصول على باقات واشتراكات الذكاء الاصطناعي بأقل تكلفة وأفضل توفير.',
        },
        {
          title: 'دعم فني متواصل 24/7',
          desc: 'فريق الدعم لدينا جاهز دائماً للإجابة على استفساراتك ومساعدتك في أي وقت.',
        },
        {
          title: 'أمان وخصوصية تامّة',
          desc: 'بياناتك وحساباتك في أمان تام دون مشاركة معلوماتك الشخصية مع أي طرف آخر.',
        },
        {
          title: 'ضمان كامل طوال الاشتراك',
          desc: 'في حال واجهتك أي مشكلة تقنية نقدم لك حلاً فورياً أو استبدالاً مجانياً للحساب.',
        },
      ],
    },
    // FAQ Section
    faq: {
      badge: 'إجابات على تساؤلاتك',
      mainTitle: 'الأسئلة الشائعة',
      items: [
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
      ],
    },
    // Footer
    footer: {
      desc: 'متجرك الرائد والأول للحصول على اشتراكات الذكاء الاصطناعي الرسمية بأعلى جودة، وأسرع تفعيل، وأفضل أسعار في العالم العربي.',
      quickLinks: 'روابط السريعة',
      supportAdmin: 'الدعم والإدارة',
      whatsappContact: 'تواصل عبر الواتساب',
      fbPage: 'صفحة الفيسبوك الرسمية',
      adminLogin: 'دخول لوحة التحكم',
      copyright: 'جميع الحقوق محفوظة © {year} AI Studio.',
      designText: 'تصميم وتطوير مستحدث لأفضل أداء على Vercel.',
    },
    // Floating WhatsApp
    floatingWhatsapp: {
      tooltip: 'تواصل فوري عبر الواتساب',
      whatsappMsg: 'مرحباً، أود التواصل مع فريق دعم AI Studio',
    },
  },
  en: {
    // Header & Navigation
    nav: {
      home: 'Home',
      products: 'Subscriptions',
      whyUs: 'Why Us?',
      faq: 'FAQ',
      admin: 'Admin',
      contactUs: 'Contact Us',
      facebookPage: 'Facebook Page',
      subtitle: 'Smart Subscriptions Store',
    },
    // Hero Section
    hero: {
      badge: '#1 Most Trusted AI & Digital Subscriptions Store',
      titlePart1: 'Step into the future of AI with',
      titlePart2: 'AI Studio',
      description: 'Get 100% official & guaranteed subscriptions for Gemini Pro, ChatGPT Plus, and CapCut Pro. Instant activation and direct WhatsApp support!',
      exploreBtn: 'Explore Plans & Pricing',
      customRequestBtn: 'Custom WhatsApp Order',
      featureFastTitle: 'Instant Delivery',
      featureFastDesc: 'Fast processing for all orders',
      featureGuaranteeTitle: '100% Full Guarantee',
      featureGuaranteeDesc: 'Official and reliable accounts',
      featureSupportTitle: '24/7 Support',
      featureSupportDesc: 'Dedicated round-the-clock service',
    },
    // Products Section
    productsSection: {
      badge: 'Available Packages',
      title: 'Choose your plan and unleash',
      titleGradient: 'Artificial Intelligence',
      subtitle: 'All plans include instant activation, official server warranty, fast WhatsApp assistance, and 24/7 technical support.',
      customNote: 'Looking for a custom plan or an unlisted tool? Contact us and we will provide it immediately!',
    },
    // Product Card
    productCard: {
      popularBadge: 'Most Popular 🔥',
      latestBadge: 'Latest Model',
      creatorBadge: 'Content Creators',
      monthly: 'monthly',
      yearly: 'yearly',
      buyBtn: 'Subscribe via WhatsApp',
      featuresTitle: 'Plan Features:',
      defaultMsg: 'Hello AI Studio, I want to subscribe to {name} for {price} ({period})',
    },
    // Why Us Section
    whyUs: {
      badge: 'Store Features',
      mainTitle: 'Why thousands choose',
      description: 'We deliver a seamless and secure experience to access top AI & design tools at official rates with full warranty.',
      items: [
        {
          title: '100% Official Subscriptions',
          desc: 'Official paid accounts guaranteed without interruption throughout your subscription period.',
        },
        {
          title: 'Instant Activation & Fast Service',
          desc: 'Once your order is confirmed via WhatsApp, your account is activated within minutes.',
        },
        {
          title: 'Best Prices on the Market',
          desc: 'We guarantee premium AI tools at the lowest cost with maximum savings.',
        },
        {
          title: '24/7 Continuous Tech Support',
          desc: 'Our dedicated support team is always ready to answer your questions anytime.',
        },
        {
          title: 'Complete Security & Privacy',
          desc: 'Your data and accounts are completely safe without sharing personal details.',
        },
        {
          title: 'Full Warranty Coverage',
          desc: 'If any technical issue arises, we provide an immediate fix or free replacement.',
        },
      ],
    },
    // FAQ Section
    faq: {
      badge: 'Got Questions?',
      mainTitle: 'Frequently Asked Questions',
      items: [
        {
          q: 'How is the subscription delivered after purchase?',
          a: 'When you click Buy Now, you will be redirected to WhatsApp with a pre-filled order message. Once confirmed, our team sends your account details instantly.',
        },
        {
          q: 'Are the subscriptions official and safe for my accounts?',
          a: '100% Yes! All our subscriptions (Gemini Pro, ChatGPT Plus, CapCut Pro) are official paid accounts ensuring risk-free access to all pro features.',
        },
        {
          q: 'What payment methods are accepted at AI Studio?',
          a: 'We accept multiple easy payment options: Vodafone Cash, Mobile Wallets, Bank Transfers, USDT, and Credit Cards.',
        },
        {
          q: 'What should I do if I face an activation issue?',
          a: 'Our tech support is available 24/7. Simply message us on WhatsApp and we will resolve it or replace your account immediately.',
        },
        {
          q: 'Can I renew monthly on the same account?',
          a: 'Absolutely! You can renew your subscription monthly or annually at special discounted rates directly via WhatsApp.',
        },
      ],
    },
    // Footer
    footer: {
      desc: 'Your premier store for official AI subscriptions with highest quality, fastest delivery, and best prices in the Arab world.',
      quickLinks: 'Quick Links',
      supportAdmin: 'Support & Admin',
      whatsappContact: 'WhatsApp Support',
      fbPage: 'Official Facebook Page',
      adminLogin: 'Admin Panel Login',
      copyright: 'All rights reserved © {year} AI Studio.',
      designText: 'Built for high performance on Vercel.',
    },
    // Floating WhatsApp
    floatingWhatsapp: {
      tooltip: 'Instant WhatsApp Support',
      whatsappMsg: 'Hello, I would like to contact AI Studio support team',
    },
  },
};
