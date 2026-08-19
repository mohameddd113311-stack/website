const { PrismaClient } = require('@prisma/client');

const regions = [
  'aws-0-eu-central-1',
  'aws-0-eu-west-1',
  'aws-0-eu-west-2',
  'aws-0-eu-west-3',
  'aws-0-me-central-1',
  'aws-0-me-south-1',
  'aws-0-us-east-1',
  'aws-0-us-west-1',
  'aws-0-ap-southeast-1',
  'aws-0-ap-northeast-1',
  'aws-0-sa-east-1'
];

async function run() {
  for (const r of regions) {
    const url = `postgresql://postgres.fcerrorhqphaggnqyyiu:Mohamed%4012345678Mm@${r}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    console.log(`Testing region ${r}...`);
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      const products = await prisma.product.findMany();
      console.log(`\n🎉 MATCH FOUND! Region is: ${r}`);
      console.log(`SUCCESS! Connected and fetched ${products.length} products!`);
      products.forEach(p => console.log(`  - [${p.id}] ${p.name}: $${p.price}`));
      await prisma.$disconnect();
      return r;
    } catch (err) {
      if (!err.message.includes("tenant/user")) {
        console.log(`  -> Connection response on ${r}:`, err.message.slice(0, 100));
      }
    } finally {
      await prisma.$disconnect();
    }
  }
  console.log("No region matched.");
}

run();
