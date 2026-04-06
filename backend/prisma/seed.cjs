const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.contact.deleteMany();

  const imageFiles = [
    "WhatsApp Image 2026-04-06 at 2.53.55 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.53.56 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.53.56 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.53.58 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.53.58 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.53.58 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.53.59 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.53.59 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.00 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.00 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.00 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.01 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.01 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.01 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.02 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.02 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.02 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.03 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.03 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.03 PM (3).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.03 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.04 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.04 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.05 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.05 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.05 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.06 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.07 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.07 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.07 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.08 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.08 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.08 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.09 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.09 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.10 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.10 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.10 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.11 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.11 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.11 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.12 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.12 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.12 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.13 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.13 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.14 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.14 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.14 PM (3).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.14 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.15 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.15 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.15 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.16 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.16 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.16 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.17 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.17 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.17 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.18 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.18 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.18 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.19 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.19 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.19 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.20 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.20 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.20 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.21 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.21 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.21 PM (3).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.21 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.22 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.22 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 3.00.08 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.18 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.18 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.18 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.19 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.19 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.19 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.20 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.20 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.20 PM (3).jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.20 PM.jpeg"
  ];

  const categories = [
    { 
      name: 'Hampers', 
      priceRange: [599, 799], 
      titles: ['Luxury Velvet Hamper', 'Aesthetic Gift Box', 'Midnight Celebration Box', 'Wellness Gift Kit', 'Royal Gifting Suite', 'Sparkling Hamper Box'],
      desc: 'A premium collection of gifts, sweets, and memories packed with love.'
    },
    { 
      name: 'Frames', 
      priceRange: [299, 499], 
      titles: ['Oak Memory Frame', 'Handcrafted Glass Frame', 'Minimalist Photo Wall', 'Classic Oak Keepsake', 'Elegant Bordered Frame', 'Vintage Memory Stand'],
      desc: 'Preserve your favorite moments in our high-quality handcrafted frames.'
    },
    { 
      name: 'Collage', 
      priceRange: [399, 649], 
      titles: ['Infinity Mosaic Collage', 'Heart-Shaped Memories', 'Dreamy Photo Grid', 'Bond For Life Montage', 'Echoes of Love Collage', 'Timeless Story Board'],
      desc: 'Multiple memories, one beautiful frame. Our collages tell your story.'
    },
    { 
      name: 'Bouquet', 
      priceRange: [449, 749], 
      titles: ['Memory Photo Bouquet', 'Eternal Flower Bouquet', 'Silk Rose Memory Wrap', 'Lavender Photo Bloom', 'Innovated Memory Charm Burst', 'Fragrant Memory Wrap'],
      desc: 'A unique twist on traditional flowers, blending images with floral beauty.'
    },
    { 
      name: 'Miniatures', 
      priceRange: [199, 399], 
      titles: ['Personalized Initial Letter', 'Mini Love Keepsake', 'Aesthetic Photo Strip', 'Handmade Pocket Charm', 'Special Message Cube', 'Dainty Photo Keyring'],
      desc: 'Small tokens of love that carry huge meaning. Perfect for surprises.'
    }
  ];

  console.log('🚀 Seeding 85 products...');

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    // Rotate through categories cyclically
    const cat = categories[i % categories.length];
    
    // Pick a title from the list based on rotation
    const titleBase = cat.titles[Math.floor(i / categories.length) % cat.titles.length];
    // Add a variation if we repeat titles
    const title = i >= (cat.titles.length * categories.length) ? `${titleBase} (Special Edition)` : titleBase;

    // Random price within range
    const price = Math.floor(Math.random() * (cat.priceRange[1] - cat.priceRange[0] + 1)) + cat.priceRange[0];

    await prisma.product.create({
      data: {
        name: title,
        price: price,
        image: `/images/${filename}`, // Public path for frontend
        description: cat.desc,
        category: cat.name,
        featured: i % 10 === 0, // Mark every 10th item as featured
        isSoldOut: false
      }
    });

    if ((i + 1) % 10 === 0) {
      console.log(`✅ Loaded ${i + 1} products...`);
    }
  }

  console.log(`\n✨ DATABASE SEEDING COMPLETE: 85 Products Added! ✨`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
