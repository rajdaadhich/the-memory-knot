const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.contact.deleteMany();

  const products = [
    // Memory Hampers
    { name: 'Luxe Velvet Memory Hamper', price: 3499, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80', description: 'Premium velvet box containing a photo frame, scented candle, and luxury chocolates.', featured: true, category: 'Hampers' },
    { name: 'Scented Soy Candle Box', price: 1599, image: 'https://images.unsplash.com/photo-1603006905003-8d4fa925c486?w=800&q=80', description: 'Aromatic hamper with handcrafted soy candles and personalized journals.', featured: false, category: 'Hampers' },
    { name: 'Chocolate & Memories Box', price: 1999, image: 'https://images.unsplash.com/photo-1582142407894-ec45a0242299?w=800&q=80', description: 'Classic wooden box filled with exotic chocolates and custom keychains.', featured: true, category: 'Hampers' },
    { name: 'Midnight Celebration Hamper', price: 2999, image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&q=80', description: 'Perfect for late-night surprises, featuring a mini cake and photo cards.', featured: false, category: 'Hampers' },
    { name: 'Eternal Love Wellness Kit', price: 2499, image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80', description: 'Self-care hamper with organic products and a custom mug.', featured: true, category: 'Hampers' },

    // Photo Bouquets & Flowers
    { name: 'Floating Memory Rose Bouquet', price: 2199, image: 'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=800&q=80', description: 'Elegant red roses with small cherished photos tucked between them.', featured: true, category: 'Innovation' },
    { name: 'Enchanted Pink Lily Bouquet', price: 1499, image: 'https://images.unsplash.com/photo-1596003906949-67221c37965c?w=800&q=80', description: 'Fresh lilies and carnations arranged in a vintage style.', featured: false, category: 'Flowers' },
    { name: 'Bohemian Wildflower Mix', price: 999, image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80', description: 'A whimsical collection of sunflowers and daisies.', featured: false, category: 'Flowers' },
    { name: 'Golden Sun & Rose Bouquet', price: 1799, image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&q=80', description: 'Vibrant yellow roses for a sunny celebration.', featured: true, category: 'Flowers' },

    // Birthday Cakes
    { name: 'Midnight Truffle Cake', price: 999, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', description: 'Rich dark chocolate truffle cake with elegant gold foil.', featured: true, category: 'Cakes' },
    { name: 'Red Velvet Anniversary Heart', price: 1199, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80', description: 'Romantic red velvet cake shaped like a heart.', featured: false, category: 'Cakes' },
    { name: 'Berry Bliss Celebration Cake', price: 1299, image: 'https://images.unsplash.com/photo-15352311df780-2016259ce364?w=800&q=80', description: 'Light vanilla sponge topped with mixed fresh berries.', featured: false, category: 'Cakes' },
    { name: 'Classic Butterscotch Delight', price: 899, image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80', description: 'Crunchy butterscotch praline cake with caramel drizzle.', featured: false, category: 'Cakes' },

    // Memory Photo Frames
    { name: 'Rustic Oak Triple Frame', price: 1899, image: 'https://images.unsplash.com/photo-1572947650440-e8a97ef05ec0?w=800&q=80', description: 'Hand-carved oak wood frame that holds three best memories.', featured: true, category: 'Frames' },
    { name: 'Minimalist Black & White Frame', price: 699, image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80', description: 'Sleek matte finish frame for modern interiors.', featured: false, category: 'Frames' },
    { name: 'Vintage Photo Strip Frame', price: 599, image: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800&q=80', description: 'Aesthetic frame designed for retro photo booth strips.', featured: false, category: 'Frames' },
    { name: 'Custom "Where We Met" Map', price: 1199, image: 'https://images.unsplash.com/photo-1476970913411-817f75b808aa?w=800&q=80', description: 'Framed map coordinates of your special location.', featured: true, category: 'Frames' },

    // Earrings & Jewelry
    { name: 'Gold-Plated Infinity Dangles', price: 1299, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', description: 'Elegant 18k gold-plated earrings for special occasions.', featured: true, category: 'Jewelry' },
    { name: 'Handmade Pearl Studs', price: 799, image: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800&q=80', description: 'Fine freshwater pearl earrings with silver backing.', featured: false, category: 'Jewelry' },
    { name: 'Boho Crystal Drop Earrings', price: 999, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce338?w=800&q=80', description: 'Sparkling crystal earrings that catch every light.', featured: false, category: 'Jewelry' },
    { name: 'Personalized Initial Necklace', price: 1799, image: 'https://images.unsplash.com/photo-1611085583191-a3b1a20a7751?w=800&q=80', description: 'Minimalist silver necklace with custom name initial.', featured: true, category: 'Jewelry' },

    // More Products to reach 25
    { name: 'Crystal Memory Cube', price: 2499, image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&q=80', description: 'Laser-engraved crystal cube with a 3D photo inside.', featured: true, category: 'Innovation' },
    { name: 'Preserved Flower Glass Dome', price: 3299, image: 'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=800&q=80', description: 'Real rose treated to last for years in a bell jar.', featured: true, category: 'Home Decor' },
    { name: 'Personalized LED Mirror', price: 1599, image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80', description: 'Mirror that glows with your name and light.', featured: false, category: 'Home Decor' },
    { name: 'Gourmet Fruit & Nut Mix', price: 1499, image: 'https://images.unsplash.com/photo-1505575967455-40e256f73376?w=800&q=80', description: 'Healthy and premium gifting hamper for all ages.', featured: false, category: 'Hampers' }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ Database Seeding Successful: ' + products.length + ' premium products added.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
