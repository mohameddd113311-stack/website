const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log("Testing connection to Supabase via Prisma...");
  try {
    const products = await prisma.product.findMany();
    console.log(`\nSUCCESS: Found ${products.length} products in Supabase PostgreSQL:`);
    products.forEach(p => {
      console.log(`- ID: [${p.id}] | Name: "${p.name}" | Price: $${p.price} (updatedAt: ${p.updatedAt.toISOString()})`);
    });
  } catch (err) {
    console.error("\nPRISMA QUERY ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
