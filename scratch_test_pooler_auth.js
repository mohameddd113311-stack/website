const { PrismaClient } = require('@prisma/client');

const testUrls = [
  "postgresql://postgres.fcerrorhqphaggnqyyiu:Mohamed%4012345678Mm@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  "postgresql://postgres.fcerrorhqphaggnqyyiu:Mohamed%4012345678Mm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  "postgresql://postgres.fcerrorhqphaggnqyyiu:Mohamed%4012345678Mm@aws-0-eu-central-1.pooler.supabase.com:5432/postgres",
  "postgresql://postgres.fcerrorhqphaggnqyyiu:Mohamed%4012345678Mm@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
];

async function testUrl(url) {
  console.log("\nTesting Pooler URL:", url);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const products = await prisma.product.findMany();
    console.log(`SUCCESS! Connected and fetched ${products.length} products!`);
    products.forEach(p => console.log(`  - [${p.id}] ${p.name}: $${p.price}`));
    return true;
  } catch (err) {
    console.error("FAILED:", err.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  for (const url of testUrls) {
    const success = await testUrl(url);
    if (success) {
      console.log("\nFound working DATABASE_URL!");
      break;
    }
  }
}

run();
