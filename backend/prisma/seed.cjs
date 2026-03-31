const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.contact.deleteMany();

  const products = [
    { name: 'Crystal Memory Cube', price: 1299, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80', description: 'Handcrafted crystal cube with personalized laser engraving.', featured: true, category: 'Home Decor' },
    { name: 'Wooden Photo Frame', price: 899, image: 'https://images.unsplash.com/photo-1572947650440-e8a97ef05ec0?w=800&q=80', description: 'Reclaimed teak wood frame for your cherished memories.', featured: true, category: 'Frames' },
    { name: 'Engraved Metal Keychain', price: 299, image: 'https://images.unsplash.com/photo-1582142407894-ec45a0242299?w=800&q=80', description: 'Stainless steel keychain with personalized name or message.', featured: false, category: 'Accessories' },
    { name: 'Ceramic Memory Mug', price: 499, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fbed50?w=800&q=80', description: 'Magic mug that reveals a photo when filled with hot liquid.', featured: true, category: 'Kitchen' },
    { name: 'Personalized Wallet', price: 1499, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', description: 'Genuine leather wallet with engraved initials.', featured: false, category: 'Mens' },
    { name: 'Customized Table Clock', price: 749, image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80', description: 'Handmade wooden clock with space for a photo.', featured: true, category: 'Home Decor' },
    { name: 'Memories Travel Diary', price: 599, image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80', description: 'Refillable leather diary for documenting your journeys.', featured: false, category: 'Stationery' },
    { name: 'Eternal Gold Necklace', price: 2499, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce338?w=800&q=80', description: '18k gold-plated necklace with a personalized locket.', featured: true, category: 'Jewelry' },
    { name: 'Handmade Scented Candle', price: 349, image: 'https://images.unsplash.com/photo-1603006905003-8d4fa925c486?w=800&q=80', description: 'Lavender scented candle in a personalized jar.', featured: false, category: 'Wellness' },
    { name: 'Custom Photo Pillow', price: 699, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=800&q=80', description: 'Soft velvet pillow with high-quality photo print.', featured: true, category: 'Home Decor' },
    { name: 'Preserved Rose Box', price: 1899, image: 'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=800&q=80', description: 'Real roses specifically treated to last for years.', featured: true, category: 'Romantic' }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('Database Seeding Successful: ' + products.length + ' products added.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
