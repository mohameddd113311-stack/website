const { updateProductAsync, getProductsAsync } = require('./src/lib/products');

async function testPut() {
  console.log("=== TESTING PRODUCT UPDATE LOGIC ===");
  const products = await getProductsAsync();
  console.log(`Current products count: ${products.length}`);
  products.forEach(p => console.log(`  - ID: "${p.id}" | Name: "${p.name}" | Price: "${p.price}"`));

  const targetId = 'gemini-pro-sub';
  console.log(`\nAttempting update for ID "${targetId}" to price "10"...`);
  const updated = await updateProductAsync(targetId, { price: "10" });
  if (updated) {
    console.log("UPDATE SUCCESSFUL! Result:", updated);
  } else {
    console.error("UPDATE FAILED! Product ID not found in list.");
  }
}

testPut();
