import fs from 'fs';
import path from 'path';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
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
    id: "gemini-pro-sub",
    name: "اشتراك Gemini Advanced / Pro",
    category: "ذكاء اصطناعي",
    price: "15",
    originalPrice: "25",
    billingPeriod: "شهرياً",
    description: "احصل على أقوى نموذج ذكاء اصطناعي من Google لإنشاء المحتوى وتصحيح الأكواد والتحليل المتقدم.",
    features: [
      "وصول كامل لنماذج Gemini 1.5 Pro الفائقة",
      "معالجة مستندات وصور فائقة السرعة",
      "إنشاء كود برمجي وتحليل بيانات معقدة",
      "تكامل مدمج مع تطبيقات Google Workspace",
      "تفعيل رسمي مضمون طوال فترة الاشتراك"
    ],
    badge: "النموذج الأحدث",
    popular: false,
    iconType: "gemini",
    whatsappMsg: "مرحباً، أريد شراء اشتراك Gemini Pro",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "chatgpt-plus-sub",
    name: "اشتراك ChatGPT Plus (GPT-4o)",
    category: "ذكاء اصطناعي",
    price: "18",
    originalPrice: "30",
    billingPeriod: "شهرياً",
    description: "تجربة الذكاء الاصطناعي الأكثر تطوراً في العالم مع نموذج GPT-4o وسرعة فائقة بدون انقطاع.",
    features: [
      "أولوية الوصول لنموذج GPT-4o و GPT-4",
      "توليد صور احترافية بدقة عالية عبر DALL-E 3",
      "تحليل الملفات المستندية والرسم البياني",
      "استخدام مكتبة الـ GPTs المخصصة وتصفح الويب",
      "تسليم وفك تفعيل رسمي وخدمة فورية"
    ],
    badge: "الأكثر طلباً 🔥",
    popular: true,
    iconType: "chatgpt",
    whatsappMsg: "مرحباً، أريد شراء اشتراك ChatGPT Plus",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "capcut-pro-sub",
    name: "اشتراك CapCut Pro",
    category: "مونتاج وتصميم",
    price: "10",
    originalPrice: "18",
    billingPeriod: "شهرياً",
    description: "الأداة الأولى لصناع المحتوى! جميع المؤثرات الاحترافية والذكاء الاصطناعي بدون علامة مائية.",
    features: [
      "فتح كافة التأثيرات والفلترات الاحترافية Pro",
      "إزالة الخلفية بالذكاء الاصطناعي بنقرة واحدة",
      "توليد الكتابة التلقائية وترجمة الفيديوهات",
      "تصدير بجودة 4K مع مساحة سحابية واسعة",
      "تفعيل على حسابك الشخصي مباشرة"
    ],
    badge: "صناع المحتوى",
    popular: false,
    iconType: "capcut",
    whatsappMsg: "مرحباً، أريد شراء اشتراك CapCut Pro",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  }
];

import { loadProductsSync, loadProductsAsync, saveProductsPersistent } from './storage';

export function getProducts(): Product[] {
  return loadProductsSync();
}

export async function getProductsAsync(): Promise<Product[]> {
  return await loadProductsAsync();
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

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
}
