import fs from 'fs';
import path from 'path';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  stockQuantity?: number;
  billingPeriod: string;
  description: string;
  features: string[];
  badge?: string;
  popular?: boolean;
  imageUrl?: string;
  iconType: 'gemini' | 'chatgpt' | 'capcut' | 'custom';
  whatsappMsg?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}


export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "chatgpt-plus-shared",
    "name": "ChatGPT Plus (مشترك)",
    "category": "ذكاء اصطناعي",
    "price": "6",
    "originalPrice": "8",
    "stockQuantity": 999,
    "billingPeriod": "شهرياً",
    "description": "اشتراك ChatGPT Plus مشترك يوفر لك أقوى قدرات الذكاء الاصطناعي مع وصول كامل لموديل GPT-4o وبسرعة فائقة.",
    "features": [
      "حساب مشترك مستقر وعالي الجودة",
      "وصول كامل لأحدث نماذج GPT-4o و GPT-4",
      "توليد صور فائقة الدقة عبر DALL-E 3",
      "تحليل متقدم للبيانات والملفات والمستندات",
      "🛡️ ضمان كامل طوال مدة الاشتراك"
    ],
    "badge": "الأكثر طلباً 🔥",
    "popular": true,
    "imageUrl": "/images/products/chatgpt-shared.jpg",
    "iconType": "chatgpt",
    "whatsappMsg": "مرحباً AI Studio، أريد شراء اشتراك ChatGPT Plus (مشترك) بسعر 300 جنيه (شهر)",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  },
  {
    "id": "chatgpt-plus-private",
    "name": "ChatGPT Plus (شخصي خاص)",
    "category": "ذكاء اصطناعي",
    "price": "23",
    "originalPrice": "30",
    "stockQuantity": 999,
    "billingPeriod": "شهرياً",
    "description": "حساب ChatGPT Plus خاص بك بالكامل، خصوصية تامة وسجل محادثات مستقل، وتفعيل رسمي مع إمكانية تغيير كلمة المرور.",
    "features": [
      "حساب شخصي خاص بالكامل على إيميلك أو حساب مستقل",
      "خصوصية تامة وسجل محادثات خاص بك وحدك",
      "وصول غير محدود لـ GPT-4o ومكتبة الـ GPTs المخصصة",
      "توليد الصور المتقدم وتحليل الملفات الكبيرة",
      "🛡️ ضمان رسمي طوال مدة الاشتراك"
    ],
    "badge": "حساب شخصي VIP ⭐",
    "popular": true,
    "imageUrl": "/images/products/chatgpt-private.jpg",
    "iconType": "chatgpt",
    "whatsappMsg": "مرحباً AI Studio، أريد شراء اشتراك ChatGPT Plus (شخصي خاص) بسعر 1150 جنيه (شهر)",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  },
  {
    "id": "gemini-pro-invite",
    "name": "Gemini Pro (دعوة شخصية)",
    "category": "ذكاء اصطناعي",
    "price": "5",
    "originalPrice": "8",
    "stockQuantity": 999,
    "billingPeriod": "18 شهر",
    "description": "تفعيل اشتراك Gemini Advanced / Pro عبر دعوة رسمية على حسابك الشخصي في Google لمدة 18 شهراً كاملاً.",
    "features": [
      "تفعيل على إيميلك الشخصي في Google مباشرة",
      "⏳ مدة الاشتراك: 18 شهراً كاملاً",
      "وصول كامل لنماذج Gemini 1.5 Pro المتقدمة",
      "سعة تخزينية سحابية مدمجة وسرعة معالجة فائقة",
      "🛡️ ضمان: 3 شهور"
    ],
    "badge": "أطول مدة ⏳",
    "popular": false,
    "imageUrl": "/images/products/gemini-pro.jpg",
    "iconType": "gemini",
    "whatsappMsg": "مرحباً AI Studio، أريد شراء اشتراك Gemini Pro (دعوة شخصية 18 شهر) بسعر 250 جنيه",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  },
  {
    "id": "gemini-pro-account",
    "name": "Gemini Pro (أكونت جاهز)",
    "category": "ذكاء اصطناعي",
    "price": "12",
    "originalPrice": "16",
    "stockQuantity": 999,
    "billingPeriod": "18 شهر",
    "description": "حساب Google كامل وجاهز ومفعل باشتراك Gemini Advanced / Pro لمدة 18 شهراً، جاهز للاستخدام الفوري.",
    "features": [
      "حساب جاهز بالكامل (إيميل وباسورد خاصين بك)",
      "⏳ مدة الاشتراك: 18 شهراً كاملاً",
      "استخدام غير محدود لنموذج Gemini 1.5 Pro المتطور",
      "إمكانية تغيير كلمة المرور والبيانات الأمنية",
      "🛡️ ضمان: 3 شهور"
    ],
    "badge": "جاهز فوراً ⚡",
    "popular": false,
    "imageUrl": "/images/products/gemini-pro.jpg",
    "iconType": "gemini",
    "whatsappMsg": "مرحباً AI Studio، أريد شراء اشتراك Gemini Pro (أكونت جاهز 18 شهر) بسعر 600 جنيه",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  },
  {
    "id": "super-grok",
    "name": "Super Grok",
    "category": "ذكاء اصطناعي",
    "price": "6",
    "originalPrice": "8",
    "stockQuantity": 0,
    "billingPeriod": "10 أيام",
    "description": "نموذج Grok 2 فائق التطور من xAI وإيلون ماسك مع قدرات تحليل حية ومتقدمة وتوليد صور بدون قيود.",
    "features": [
      "وصول فوري لنموذج Super Grok المتقدم",
      "⏳ مدة الاشتراك: 10 أيام",
      "توليد صور واقعية فائقة الدقة والتحليل الإخباري المباشر",
      "🛡️ ضمان: 5 أيام",
      "⚠️ غير متاح حالياً"
    ],
    "badge": "غير متاح حالياً ⚠️",
    "popular": false,
    "imageUrl": "/images/products/super-grok.jpg",
    "iconType": "custom",
    "whatsappMsg": "مرحباً AI Studio، أستفسر عن توفر اشتراك Super Grok بسعر 300 جنيه (10 أيام)",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  },
  {
    "id": "canva-pro",
    "name": "Canva Pro (سنة كاملة)",
    "category": "تصميم وجرافيك",
    "price": "1",
    "originalPrice": "3",
    "stockQuantity": 999,
    "billingPeriod": "سنة كاملة",
    "description": "اشتراك Canva Pro الأصلي لمدة سنة كاملة على حسابك الشخصي مع فتح كل القوالب والميزات المدفوعة.",
    "features": [
      "⏳ مدة الاشتراك: سنة كاملة",
      "تفعيل على إيميلك وحسابك الشخصي في Canva",
      "فتح ملايين الصور والخطوط والقوالب المدفوعة",
      "أدوات الذكاء الاصطناعي وإزالة الخلفية بضغطة زر",
      "🛡️ ضمان: شهر"
    ],
    "badge": "عرض خاص 🎨",
    "popular": false,
    "imageUrl": "/images/products/canva-pro.jpg",
    "iconType": "custom",
    "whatsappMsg": "مرحباً AI Studio، أريد شراء اشتراك Canva Pro (سنة كاملة) بسعر 50 جنيه",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  },
  {
    "id": "capcut-pro-week",
    "name": "CapCut Pro (أسبوع - 500 كريديت)",
    "category": "مونتاج وتصميم",
    "price": "1",
    "originalPrice": "2",
    "stockQuantity": 999,
    "billingPeriod": "أسبوع",
    "description": "تفعيل CapCut Pro رسمي لمدة أسبوع مع رصيد 500 كريديت لجميع أدوات الذكاء الاصطناعي والتأثيرات.",
    "features": [
      "⏳ مدة الاشتراك: أسبوع",
      "🔹 رصيد 500 كريديت لأدوات ومؤثرات الذكاء الاصطناعي",
      "فتح كافة الفلاتر والانتقالات والمؤثرات Pro",
      "تصدير الفيديو بجودة 4K وبدون علامة مائية",
      "🛡️ ضمان طوال مدة الاشتراك"
    ],
    "badge": "باقة أسبوعية 🎬",
    "popular": false,
    "imageUrl": "/images/products/capcut-pro.jpg",
    "iconType": "capcut",
    "whatsappMsg": "مرحباً AI Studio، أريد شراء اشتراك CapCut Pro (أسبوع 500 كريديت) بسعر 50 جنيه",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  },
  {
    "id": "capcut-pro-month-500",
    "name": "CapCut Pro (شهر - 500 كريديت)",
    "category": "مونتاج وتصميم",
    "price": "3",
    "originalPrice": "5",
    "stockQuantity": 999,
    "billingPeriod": "شهرياً",
    "description": "اشتراك شهري كامل في CapCut Pro مع 500 كريديت شهرياً لصناع المحتوى ومحرري الفيديو.",
    "features": [
      "⏳ مدة الاشتراك: شهر",
      "🔹 رصيد 500 كريديت لميزات AI وتوليد الترجمة التلقائية",
      "مكتبة القوالب السحابية الاحترافية غير المحدودة",
      "إزالة الخلفيات والمؤثرات الصوتية المتقدمة",
      "🛡️ ضمان طوال مدة الاشتراك"
    ],
    "badge": "الأكثر توفيراً ✂️",
    "popular": false,
    "imageUrl": "/images/products/capcut-pro.jpg",
    "iconType": "capcut",
    "whatsappMsg": "مرحباً AI Studio، أريد شراء اشتراك CapCut Pro (شهر 500 كريديت) بسعر 150 جنيه",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  },
  {
    "id": "capcut-pro-month-1200",
    "name": "CapCut Pro (شهر - 1200 كريديت)",
    "category": "مونتاج وتصميم",
    "price": "4",
    "originalPrice": "6",
    "stockQuantity": 999,
    "billingPeriod": "شهرياً",
    "description": "الباقة الأقوى لصناع المحتوى المحترفين في CapCut Pro مع رصيد ضخم 1200 كريديت لإنجاز الفيديوهات بدون قيود.",
    "features": [
      "⏳ مدة الاشتراك: شهر",
      "🔹 رصيد ضخم 1200 كريديت لجميع أدوات AI المتقدمة",
      "توليد ترجمة فورية وكتابة تلقائية لكافة اللغات",
      "تصدير بدقة 4K و 60 إطار في الثانية وبدون أي علامة مائية",
      "🛡️ ضمان طوال مدة الاشتراك"
    ],
    "badge": "باقة المحترفين 🚀",
    "popular": false,
    "imageUrl": "/images/products/capcut-pro.jpg",
    "iconType": "capcut",
    "whatsappMsg": "مرحباً AI Studio، أريد شراء اشتراك CapCut Pro (شهر 1200 كريديت) بسعر 200 جنيه",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  },
  {
    "id": "adobe-all-apps",
    "name": "Adobe All Apps (4 شهور)",
    "category": "تصميم وجرافيك",
    "price": "30",
    "originalPrice": "40",
    "stockQuantity": 999,
    "billingPeriod": "4 شهور",
    "description": "دعم جميع برامج أدوبي الأصلية (Photoshop, Premiere, Illustrator, After Effects, InDesign...) يعمل على جهازين بالتزامن.",
    "features": [
      "دعم جميع برامج أدوبي بلا استثناء",
      "⏳ مدة الاشتراك: 4 شهور",
      "💻 يعمل على جهازين",
      "ميزات الذكاء الاصطناعي Generative Fill وتحديثات رسمية",
      "🛡️ ضمان طوال مدة الاشتراك"
    ],
    "badge": "شامل جميع البرامج 🎨",
    "popular": true,
    "imageUrl": "/images/products/adobe-all.jpg",
    "iconType": "custom",
    "whatsappMsg": "مرحباً AI Studio، أريد شراء اشتراك Adobe All Apps (4 شهور على جهازين) بسعر 1500 جنيه",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  },
  {
    "id": "duolingo-plus",
    "name": "Duolingo Super (سنة كاملة)",
    "category": "تعليم ولغات",
    "price": "5",
    "originalPrice": "8",
    "stockQuantity": 999,
    "billingPeriod": "سنة كاملة",
    "description": "اشتراك Duolingo Super لتعلم جميع لغات العالم بدون إعلانات وبقلوب غير محدودة على حسابك الشخصي.",
    "features": [
      "⏳ مدة الاشتراك: سنة كاملة",
      "لتعلم جميع اللغات",
      "قلوب وطاقة غير محدودة لمواصلة التعلم بدون توقف",
      "خالٍ تماماً من الإعلانات لتجربة تعليمية سلسة",
      "مراجعة مخصصة للأخطاء واختبارات قياس المستوى المتقدمة"
    ],
    "badge": "سنة كاملة 🌍",
    "popular": false,
    "imageUrl": "/images/products/duolingo.jpg",
    "iconType": "custom",
    "whatsappMsg": "مرحباً AI Studio، أريد شراء اشتراك Duolingo Super (سنة كاملة) بسعر 250 جنيه",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  },
  {
    "id": "claude-pro",
    "name": "Claude Pro (كلود برو)",
    "category": "ذكاء اصطناعي",
    "price": "25",
    "originalPrice": "30",
    "stockQuantity": 999,
    "billingPeriod": "شهرياً",
    "description": "اشتراك Claude Pro الرسمي من Anthropic، النموذج الأول عالمياً في البرمجة وكتابة النصوص المعقدة وتحليل المستندات.",
    "features": [
      "تفعيل رسمي 100%",
      "وصول كامل لأحدث نماذج Claude 3.5 Sonnet",
      "ميزة Claude Artifacts التفاعلية لتطوير التطبيقات",
      "حدود استخدام أعلى بـ 5 أضعاف مقارنة بالمجاني",
      "🛡️ ضمان طول المده"
    ],
    "badge": "الأفضل للبرمجة 💻",
    "popular": true,
    "imageUrl": "/images/products/claude-pro.jpg",
    "iconType": "custom",
    "whatsappMsg": "مرحباً AI Studio، أريد شراء اشتراك Claude Pro بسعر 1250 جنيه (شهر)",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  }
];

import {
  loadProductsSync,
  loadProductsAsync,
  saveProductsPersistent,
  invalidateProductsCache,
  upsertSingleProduct,
  deleteSingleProduct,
} from './storage';

export { invalidateProductsCache, upsertSingleProduct, deleteSingleProduct };

export function getProducts(): Product[] {
  return loadProductsSync();
}

export async function getProductsAsync(forceRefresh: boolean = false): Promise<Product[]> {
  return await loadProductsAsync(forceRefresh);
}

export function saveProducts(products: Product[]): boolean {
  const now = new Date().toISOString();
  const productsWithTimestamps = products.map(p => ({
    ...p,
    createdAt: p.createdAt || now,
    updatedAt: p.updatedAt || now,
  }));

  saveProductsPersistent(productsWithTimestamps);
  return true;
}

export async function saveProductsAsync(products: Product[]): Promise<boolean> {
  const now = new Date().toISOString();
  const productsWithTimestamps = products.map(p => ({
    ...p,
    createdAt: p.createdAt || now,
    updatedAt: p.updatedAt || now,
  }));

  return await saveProductsPersistent(productsWithTimestamps);
}

export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find(p => p.id === id);
}

export function addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const products = getProducts();
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...productData,
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: now,
    updatedAt: now,
  };
  const updated = [newProduct, ...products];
  saveProducts(updated);
  return newProduct;
}

export async function addProductAsync(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...productData,
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: now,
    updatedAt: now,
  };
  // Fast: upsert only the new product to Supabase, no need to reload all products
  const ok = await upsertSingleProduct(newProduct);
  if (!ok) throw new Error('Failed to save new product to Supabase');
  return newProduct;
}

export function updateProduct(id: string, productData: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updatedProduct = { 
    ...products[index], 
    ...productData,
    updatedAt: now,
  };
  products[index] = updatedProduct;
  saveProducts(products);
  return updatedProduct;
}

export async function updateProductAsync(id: string, productData: Partial<Product>): Promise<Product | null> {
  const products = await getProductsAsync();
  const existing = products.find(p => p.id === id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updatedProduct: Product = {
    ...existing,
    ...productData,
    id,
    updatedAt: now,
  };
  // Fast: upsert only the changed product, not all products
  const ok = await upsertSingleProduct(updatedProduct);
  if (!ok) throw new Error('Failed to update product in Supabase');
  return updatedProduct;
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
}

export async function deleteProductAsync(id: string): Promise<boolean> {
  // Fast: delete only this product from Supabase directly
  const ok = await deleteSingleProduct(id);
  return ok;
}

