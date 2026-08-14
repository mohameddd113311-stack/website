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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
  }
];

let memoryProductsStore: Product[] = [...INITIAL_PRODUCTS];
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'products.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
    }
  } catch (error) {
    console.warn("Notice: File system write restricted. Operating in memory mode.", error);
  }
}

export function getProducts(): Product[] {
  try {
    ensureDataFile();
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProductsStore = parsed;
      }
    }
  } catch (error) {
    console.warn("Reading from products file failed, using memory store:", error);
  }
  return memoryProductsStore;
}

export function saveProducts(products: Product[]): boolean {
  memoryProductsStore = products;
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.warn("Saved to memory store (Serverless mode active)", error);
    return true;
  }
}

export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find(p => p.id === id);
}

export function addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...productData,
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString()
  };
  const updated = [newProduct, ...products];
  saveProducts(updated);
  return newProduct;
}

export function updateProduct(id: string, productData: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updatedProduct = { ...products[index], ...productData };
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
