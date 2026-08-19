const { PrismaClient } = require('@prisma/client');

const testUrls = [
  "postgresql://postgres.fcerrorhqphaggnqyyiu:Mohamed%4012345678Mm@aws-0-me-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  "postgresql://postgres.fcerrorhqphaggnqyyiu:Mohamed%4012345678Mm@aws-0-me-central-1.pooler.supabase.com:5432/postgres",
  "postgresql://postgres.fcerrorhqphaggnqyyiu:Mohamed%4012345678Mm@aws-0-me-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  "postgresql://postgres.fcerrorhqphaggnqyyiu:Mohamed%4012345678Mm@aws-0-me-south-1.pooler.supabase.com:5432/postgres"
];

async function run() {
  for (const url of testUrls) {
    console.log("\nTesting:", url);
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      const products = await prisma.product.findMany();
      console.log(`\n🎉🎉🎉 SUCCESS! Connected and fetched ${products.length} products!`);
      products.forEach(p => console.log(`  - [${p.id}] ${p.name}: $${p.price}`));
      await prisma.$disconnect();
      break;
    } catch (err) {
      console.log("Error details:", err.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

run();
