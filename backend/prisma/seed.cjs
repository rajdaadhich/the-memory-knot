const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PRODUCT_DESCRIPTIONS = {
  // Hampers
  'Luxury Velvet Hamper': 'Indulge your loved ones with this premium velvet box containing selection of artisan chocolates, a scented candle, a personalized photo frame, and a handwritten card.',
  'Aesthetic Gift Box': 'A beautifully curated pastel gift box featuring aesthetic journals, custom ceramic mug, organic teas, and a mini dry flower bouquet.',
  'Midnight Celebration Box': 'The ultimate late-night surprise box containing a premium mini chocolate cake, birthday/anniversary banners, fairy lights, and a customized photo frame.',
  'Wellness Gift Kit': 'A refreshing self-care bundle with essential oils, handmade luxury soaps, a satin eye mask, and a customized motivational quote plaque.',
  'Royal Gifting Suite': 'A majestic velvet hamper packed with traditional dry fruits, hand-painted clay diyas, a brass photo frame, and luxury perfumes.',
  'Sparkling Hamper Box': 'Celebrate special achievements with this glittering box featuring a mocktail bottle, custom glasses, snacks, and a memory photo roll.',
  // Frames
  'Oak Memory Frame': 'Handcrafted premium natural oak wood frame with glass overlay. Includes a high-quality matte print of your favorite photo. Size: 8x10 inches.',
  'Handcrafted Glass Frame': 'Elegant minimalist floating glass frame with brass borders. Perfect for pressed flowers and cherished photos. Size: 6x8 inches.',
  'Minimalist Photo Wall': 'A gorgeous set of 3 matching black minimalist composite wood frames with pre-installed wall mounts. Perfect for grid collages.',
  'Classic Oak Keepsake': 'Solid oak desktop frame featuring a deep shadow-box design to hold physical keepsakes alongside your photo.',
  'Elegant Bordered Frame': 'A premium wide-bordered white frame with double matting, giving a gallery-quality display to your special moments.',
  'Vintage Memory Stand': 'A rotating wooden block frame mounted on a vintage metal stand, holding up to 4 double-sided printed memory cards.',
  // Collage
  'Infinity Mosaic Collage': 'A breathtaking mosaic design compiled from 50 of your tiny photos to form one main gorgeous portrait. Size: 12x18 inches.',
  'Heart-Shaped Memories': 'A beautiful arrangement of 30 of your favorite pictures shaped into a heart. Printed on premium archival semi-gloss paper.',
  'Dreamy Photo Grid': 'A symmetrical 9-photo grid print with clean margins, housed in a modern black wooden frame with a glass panel.',
  'Bond For Life Montage': 'A storytelling collage layout combining multiple photo sizes with personalized text quotes and special dates.',
  'Echoes of Love Collage': 'A romantic design featuring soft overlays, watercolor background elements, and space for 12 couple photos.',
  'Timeless Story Board': 'A chronological film-strip style photo collage capturing your journey from the beginning to now. Size: 8x24 inches.',
  // Bouquet
  'Memory Photo Bouquet': 'A stunning custom bouquet where beautiful hand-rolled silk roses are interweaved with 10 of your printed memory cards.',
  'Eternal Flower Bouquet': 'A gorgeous dried flower arrangement featuring baby\'s breath and pampas grass, with custom photo tags attached.',
  'Silk Rose Memory Wrap': 'A luxury flower wrap with 12 artificial red silk roses, fairy lights, and a personalized romantic letter scroll.',
  'Lavender Photo Bloom': 'A soothing artificial lavender bouquet bundled with a vintage jute wrap and holding custom printed polaroids.',
  'Innovated Memory Charm Burst': 'A premium bouquet containing chocolate truffles, paper roses, and hanging custom photo charms.',
  'Fragrant Memory Wrap': 'A hand-tied bouquet of fragrant soap-roses that never fade, decorated with custom name tags and ribbons.',
  // Miniatures
  'Personalized Initial Letter': 'A custom wooden initial letter of your choice, filled with a beautiful miniature collage of your favorite photos.',
  'Mini Love Keepsake': 'A tiny handcrafted glass bottle containing a rolled custom message scroll and a micro polaroid photo.',
  'Aesthetic Photo Strip': 'A set of 3 vintage retro-style photo booth strips printed on thick textured cardstock with customized dates.',
  'Handmade Pocket Charm': 'A double-sided miniature metal photo charm that fits in a pocket or hangs as a keepsake. Size: 1.5 inches.',
  'Special Message Cube': 'A wooden folding cube that opens up to reveal 6 different hidden photos and messages in an accordion fold.',
  'Dainty Photo Keyring': 'A premium genuine leather keyring sleeve that slides open to reveal a mini printed photo plate.'
};

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

    const description = PRODUCT_DESCRIPTIONS[titleBase] || cat.desc;

    await prisma.product.create({
      data: {
        name: title,
        price: price,
        image: `/images/${filename}`, // Public path for frontend
        description: description,
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
