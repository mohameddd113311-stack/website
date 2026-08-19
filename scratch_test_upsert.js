const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpsert() {
  console.log("Testing upsert product via Supabase REST API...");
  const sampleProduct = {
    id: 'gemini-pro-sub',
    name: 'اشتراك Gemini Advanced / Pro',
    category: 'ذكاء اصطناعي',
    price: '8',
    original_price: '12',
    stock_quantity: 999,
    billing_period: 'شهرياً',
    description: 'احصل على أقوى نموذج ذكاء اصطناعي من Google لإنشاء المحتوى وتصحيح الأكواد والتحليل المتقدم.',
    features: ["نموذج Gemini 1.5 Pro للإنشاء المتطوّر", "معالجة مستندات وصور فائقة السرعة", "إنشاء كود برمجي وتحليل بيانات معقدة", "تكامل مدمج مع تطبيقات Google Workspace"],
    badge: 'الأكثر شعبية',
    popular: true,
    icon_type: 'gemini',
    active: true,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('products').upsert(sampleProduct, { onConflict: 'id' }).select();
  if (error) {
    console.error("UPSERT ERROR:", error);
  } else {
    console.log("UPSERT SUCCESS! Result:", data);
  }
}

testUpsert();
