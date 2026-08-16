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

-- 3. Insert Initial Default Site Settings
INSERT INTO site_settings (id, whatsapp_number, facebook_url, usd_to_egp_rate)
VALUES ('default', '201021510826', 'https://www.facebook.com/share/1NbRrA56uz/', 50.0)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Initial Default Products
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
  '["وصول كامل لنماذج Gemini 1.5 Pro الفائقة", "معالجة مستندات وصور فائقة السرعة", "إنشاء كود برمجي وتحليل بيانات معقدة", "تكامل مدمج مع تطبيقات Google Workspace", "تفعيل رسمي مضمون طوال فترة الاشتراك"]'::jsonb,
  'النموذج الأحدث',
  false,
  'gemini',
  'مرحباً، أريد شراء اشتراك Gemini Pro',
  true
),
(
  'chatgpt-plus-sub',
  'اشتراك ChatGPT Plus (GPT-4o)',
  'ذكاء اصطناعي',
  '9',
  '15',
  999,
  'شهرياً',
  'تجربة الذكاء الاصطناعي الأكثر تطوراً في العالم مع نموذج GPT-4o وسرعة فائقة بدون انقطاع.',
  '["أولوية الوصول لنموذج GPT-4o و GPT-4", "توليد صور احترافية بدقة عالية عبر DALL-E 3", "تحليل الملفات المستندية والرسم البياني", "استخدام مكتبة الـ GPTs المخصصة وتصفح الويب", "تسليم وفك تفعيل رسمي وخدمة فورية"]'::jsonb,
  'الأكثر طلباً 🔥',
  true,
  'chatgpt',
  'مرحباً، أريد شراء اشتراك ChatGPT Plus',
  true
),
(
  'capcut-pro-sub',
  'اشتراك CapCut Pro',
  'مونتاج وتصميم',
  '4',
  '7',
  999,
  'شهرياً',
  'الأداة الأولى لصناع المحتوى! جميع المؤثرات الاحترافية والذكاء الاصطناعي بدون علامة مائية.',
  '["فتح كافة التأثيرات والفلترات الاحترافية Pro", "إزالة الخلفية بالذكاء الاصطناعي بنقرة واحدة", "توليد الكتابة التلقائية وترجمة الفيديوهات", "تصدير بجودة 4K مع مساحة سحابية واسعة", "تفعيل على حسابك الشخصي مباشرة"]'::jsonb,
  'صناع المحتوى',
  false,
  'capcut',
  'مرحباً، أريد شراء اشتراك CapCut Pro',
  true
)
ON CONFLICT (id) DO NOTHING;
