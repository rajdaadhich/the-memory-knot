const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating all product prices to ₹1...');
  
  const result = await prisma.product.updateMany({
    data: {
      price: 1.0
    }
  });

  console.log(`✅ Success! Updated ${result.count} products to ₹1.`);
}

main()
  .catch((e) => {
    console.error('Failed to update product prices:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
