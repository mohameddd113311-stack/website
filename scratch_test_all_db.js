const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

// Read .env file manually
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

console.log("=== SUPABASE & PRISMA DIAGNOSTIC TEST ===");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "PRESENT" : "MISSING");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "PRESENT" : "MISSING");
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "PRESENT" : "MISSING");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "PRESENT" : "MISSING");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function testSupabaseREST() {
  if (!supabaseUrl || !supabaseKey) {
    console.log("\n[Supabase REST] SKIPPED (Missing URL or Key)");
    return;
  }
  console.log("\n[Supabase REST] Testing fetch products...");
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error("[Supabase REST] FETCH ERROR:", error);
  } else {
    console.log(`[Supabase REST] SUCCESS! Fetched ${data ? data.length : 0} products:`);
    if (data) data.forEach(p => console.log(`  - [${p.id}] ${p.name}: $${p.price}`));
  }
}

async function testPrisma() {
  if (!process.env.DATABASE_URL) {
    console.log("\n[Prisma DB] SKIPPED (Missing DATABASE_URL)");
    return;
  }
  console.log("\n[Prisma DB] Testing fetch products...");
  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany();
    console.log(`[Prisma DB] SUCCESS! Fetched ${products.length} products:`);
    products.forEach(p => console.log(`  - [${p.id}] ${p.name}: $${p.price}`));
  } catch (err) {
    console.error("[Prisma DB] FETCH ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  await testSupabaseREST();
  await testPrisma();
}

run();
