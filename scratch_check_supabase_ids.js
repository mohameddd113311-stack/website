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

async function inspectTable() {
  console.log("=== INSPECTING SUPABASE PRODUCTS TABLE ===");
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error("SELECT ERROR:", error);
  } else {
    console.log(`Found ${data.length} rows in 'products' table:`);
    data.forEach((row, i) => {
      console.log(`\nRow #${i + 1}:`);
      console.log(`  id: "${row.id}"`);
      console.log(`  name: "${row.name}"`);
      console.log(`  price: "${row.price}"`);
      console.log(`  original_price: "${row.original_price}"`);
      console.log(`  billing_period: "${row.billing_period}"`);
      console.log(`  active: ${row.active}`);
      console.log(`  updated_at: "${row.updated_at}"`);
    });
  }
}

inspectTable();
