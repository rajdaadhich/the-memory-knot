const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: 'Boquet',
    subCategories: ['Polaroid boquets', 'jewellery boquets', 'hair accesories boquet', 'hotwheels boquet', 'choclate boquet'],
    titles: ['Classic Polaroid Bouquet', 'Chic Jewellery Bloom', 'Dainty Hair Bow Bouquet', 'Hot Wheels Speed Wrap', 'Decadent Chocolate Truffle Bouquet'],
    priceRange: [399, 899]
  },
  {
    name: 'Hampers',
    subCategories: ['Premium Hampers', 'Self Care Hampers', 'Chocolate Hampers', 'Celebration Hampers'],
    titles: ['Royal Velvet Hamper', 'Serene Self-Care Suite', 'Chocolatier Fantasy Hamper', 'Ultimate Birthday Celebration Box'],
    priceRange: [599, 1299]
  },
  {
    name: 'Jewellery',
    subCategories: ['earing', 'bracelet', 'anlet', 'necklace', 'ring'],
    titles: ['Pearl Drops Earrings', 'Infinite Love Chain Bracelet', 'Delicate Golden Anklet', 'Moonstone Pendant Necklace', 'Sparkling Eternity Ring'],
    priceRange: [199, 599]
  },
  {
    name: 'Mini Boquet',
    subCategories: ['Polaroid boquets', 'jewellery boquets', 'hair accesories boquet', 'hotwheels boquet', 'choclate boquet'],
    titles: ['Pocket Polaroid Bouquet', 'Mini Jewellery Charm Bloom', 'Mini Hair Accessories Bouquet', 'Mini Hot Wheels Speed Bouquet', 'Mini Ferrero Chocolate Wrap'],
    priceRange: [249, 499]
  },
  {
    name: 'Mini Hampers',
    subCategories: ['Polaroid boquets', 'jewellery boquets', 'hair accesories boquet', 'hotwheels boquet', 'choclate boquet'],
    titles: ['Mini Polar Keepsake Hamper', 'Mini Pearl Treasure Box', 'Mini Hair Accessory Hamper', 'Mini Hot Wheels Toy Hamper', 'Mini Chocolate Cravings Box'],
    priceRange: [299, 599]
  },
  {
    name: 'Accesories',
    subCategories: [],
    titles: ['Aesthetic Matching Clips Set', 'Custom Painted Name Pin', 'Floral Hair Band Keepsake', 'Embroidered Pocket Detail Accent'],
    priceRange: [149, 399]
  },
  {
    name: 'Personalised',
    subCategories: ['magazines', 'personalised tshirts', 'mobile covers', 'mug / cups', 'keychains'],
    titles: ['Personalised Love Story Magazine', 'Custom Photo Printed Tee', 'Aesthetic Personalised Mobile Cover', 'Custom Ceramic Couple Mug', 'Handcrafted Leather Photo Keyring'],
    priceRange: [199, 799]
  }
];

const OCCASIONS = [
  'birthday', 'anniversiry', 'engagement', 'baby shower', 'proposal', 'mothers day', 'fathers day', 
  'valentines week days', 'diwali', 'eid', 'rakhi', 'holi', 'christmas', 'sisters day', 
  'boyfriends day', 'girlfriends day'
];

const GIFT_FOR_OPTIONS = ['male', 'female', null];

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

  console.log(`🚀 Seeding ${imageFiles.length} products across all categories and filter types...`);

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    
    // Rotate through categories cyclically
    const cat = CATEGORIES[i % CATEGORIES.length];
    
    // Select subcategory if available
    const hasSubCategories = cat.subCategories.length > 0;
    const subCategory = hasSubCategories 
      ? cat.subCategories[Math.floor(i / CATEGORIES.length) % cat.subCategories.length] 
      : null;
      
    // Pick base title
    const baseTitleIndex = Math.floor(i / CATEGORIES.length) % cat.titles.length;
    const baseTitle = cat.titles[baseTitleIndex];
    
    // Create unique title variations
    const titleEdition = Math.floor(i / (CATEGORIES.length * cat.titles.length));
    const title = titleEdition > 0 ? `${baseTitle} (Series ${titleEdition + 1})` : baseTitle;
    
    // Random price within category price range
    const price = Math.floor(Math.random() * (cat.priceRange[1] - cat.priceRange[0] + 1)) + cat.priceRange[0];
    
    // Rotate through occasions and gender targets
    const occasion = OCCASIONS[i % OCCASIONS.length];
    const giftFor = GIFT_FOR_OPTIONS[i % GIFT_FOR_OPTIONS.length];
    
    // Formulate a description
    const giftForText = giftFor === 'male' ? 'for Him' : giftFor === 'female' ? 'for Her' : 'for Everyone';
    const description = `A premium handcrafted item from our ${cat.name} collection. It features high-quality materials and customized craftsmanship. Perfect for ${occasion} celebrations, especially curated ${giftForText}.`;

    await prisma.product.create({
      data: {
        name: title,
        price: price,
        image: `/images/${filename}`,
        description: description,
        category: cat.name,
        subCategory: subCategory,
        occasion: occasion,
        giftFor: giftFor,
        featured: i % 8 === 0, // Make some items featured
        isSoldOut: false
      }
    });

    if ((i + 1) % 15 === 0) {
      console.log(`✅ Loaded ${i + 1} products...`);
    }
  }

  console.log(`\n✨ DATABASE REED SEEDING COMPLETE: Loaded ${imageFiles.length} customized products! ✨`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
