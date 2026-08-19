-- =============================================
-- Supabase / PostgreSQL Schema setup for AI Studio
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create products table with stock_quantity and image_url
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'ذكاء اصطناعي',
  price TEXT NOT NULL,
  original_price TEXT,
  stock_quantity INT DEFAULT 999,
  billing_period TEXT DEFAULT 'شهرياً',
  description TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  popular BOOLEAN DEFAULT false,
  image_url TEXT,
  icon_type TEXT DEFAULT 'gemini',
  whatsapp_msg TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create site_settings table with exchange rate
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  whatsapp_number TEXT DEFAULT '201021510826',
  facebook_url TEXT DEFAULT 'https://www.facebook.com/share/1NbRrA56uz/',
  usd_to_egp_rate NUMERIC DEFAULT 50.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Disable Row Level Security (RLS) so API queries can read and write freely
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- 4. Insert Initial Default Site Settings
INSERT INTO site_settings (id, whatsapp_number, facebook_url, usd_to_egp_rate)
VALUES ('default', '201021510826', 'https://www.facebook.com/share/1NbRrA56uz/', 50.0)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Initial Default Products
INSERT INTO products (id, name, category, price, original_price, stock_quantity, billing_period, description, features, badge, popular, icon_type, whatsapp_msg, active)
VALUES 
(
  'gemini-pro-sub',
  'اشتراك Gemini Advanced / Pro',
  'ذكاء اصطناعي',
  '8',
  '12',
  999,
  'شهرياً',
  'احصل على أقوى نموذج ذكاء اصطناعي من Google لإنشاء المحتوى وتصحيح الأكواد والتحليل المتقدم.',
  '["نموذج Gemini 1.5 Pro للإنشاء المتطوّر", "معالجة مستندات وصور فائقة السرعة", "إنشاء كود برمجي وتحليل بيانات معقدة", "تكامل مدمج مع تطبيقات Google Workspace"]'::jsonb,
  'الأكثر شعبية',
  true,
  'gemini',
  'مرحباً AI Studio، أريد شراء اشتراك [Gemini Advanced / Pro] بسعر $8 شهرياً',
  true
),
(
  'chatgpt-plus-sub',
  'اشتراك ChatGPT Plus (GPT-4o)',
  'ذكاء اصطناعي',
  '15',
  '20',
  999,
  'شهرياً',
  'الوصول الفوري لأحدث نماذج OpenAI الذكية مع سرعة استجابة فائقة وتحليل الصور والمستندات.',
  '["الوصول الكامل للنموذج الأحدث GPT-4o", "توليد صور فائقة الدقة عبر DALL-E 3", "تحليل ملفات البي دي إف والبيانات الضخمة", "إنشاء وتخصيص نماذج Custom GPTs"]'::jsonb,
  'النموذج الأحدث',
  false,
  'chatgpt',
  'مرحباً AI Studio، أريد شراء اشتراك [ChatGPT Plus (GPT-4o)] بسعر $15 شهرياً',
  true
),
(
  'capcut-pro-sub',
  'اشتراك CapCut Pro (مونتاج محترف)',
  'تصميم ومونتاج',
  '6',
  '10',
  999,
  'شهرياً',
  'افتح كامل المميزات الاحترافية والمؤثرات الذكية لمنشوراتك وفيديوهاتك دون علامة مائية.',
  '["إزالة الخلفيات وتتبع الحركة بالذكاء الاصطناعي", "مكتبة مؤثرات وانتقالات VIP حصرية", "تصدير فيديوهات بدقة 4K بدقة عالية جداً", "تخزين سحابي ومزامنة عبر الجوال والكمبيوتر"]'::jsonb,
  'عرض خاص',
  false,
  'capcut',
  'مرحباً AI Studio، أريد شراء اشتراك [CapCut Pro] بسعر $6 شهرياً',
  true
)
ON CONFLICT (id) DO NOTHING;
