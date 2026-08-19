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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcerrorhqphaggnqyyiu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_dRMbXNN3PaDsQYZXRh4axw_YwyfO5wF';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdatePrice(newPrice) {
  console.log(`\nTesting price update in Supabase to "$${newPrice}"...`);
  
  // 1. Fetch current product
  const { data: current, error: fetchErr } = await supabase.from('products').select('*').eq('id', 'gemini-pro-sub').single();
  if (fetchErr) {
    console.error("Fetch error:", fetchErr);
    return;
  }
  console.log(`Current price in DB: "$${current.price}"`);

  // 2. Update price
  const updatedPayload = {
    ...current,
    price: String(newPrice),
    updated_at: new Date().toISOString()
  };

  const { data: result, error: updateErr } = await supabase.from('products').upsert(updatedPayload).select();
  if (updateErr) {
    console.error("Update error:", updateErr);
  } else {
    console.log("UPDATE SUCCESSFUL! New DB Row:", result);
  }
}

async function run() {
  await testUpdatePrice("10");
}

run();
