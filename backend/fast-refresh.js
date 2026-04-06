const { Client } = require('pg');
require('dotenv').config();

async function fastRefresh() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const imageFiles = [
    "WhatsApp Image 2026-04-06 at 2.53.55 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.53.56 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 2.53.56 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.53.58 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 2.53.58 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.53.58 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.53.59 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 2.53.59 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.00 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.00 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.00 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.01 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.01 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.01 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.02 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.02 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.02 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.03 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.03 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.03 PM (3).jpeg", "WhatsApp Image 2026-04-06 at 2.54.03 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.04 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 2.54.04 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.05 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.05 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.05 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.06 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.07 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 2.54.07 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.07 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.08 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 2.54.08 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.08 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.09 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 2.54.09 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.10 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.10 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.10 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.11 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.11 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.11 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.12 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.12 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.12 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.13 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.13 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.14 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 2.54.14 PM (2).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.14 PM (3).jpeg", "WhatsApp Image 2026-04-06 at 2.54.14 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.15 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.15 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.15 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.16 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.16 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.16 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.17 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.17 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.17 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.18 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.18 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.18 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.19 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.19 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.19 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.20 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.20 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.20 PM.jpeg", "WhatsApp Image 2026-04-06 at 2.54.21 PM (1).jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.21 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 2.54.21 PM (3).jpeg", "WhatsApp Image 2026-04-06 at 2.54.21 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 2.54.22 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 2.54.22 PM.jpeg", "WhatsApp Image 2026-04-06 at 3.00.08 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.18 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 3.07.18 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 3.07.18 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.19 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 3.07.19 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 3.07.19 PM.jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.20 PM (1).jpeg", "WhatsApp Image 2026-04-06 at 3.07.20 PM (2).jpeg", "WhatsApp Image 2026-04-06 at 3.07.20 PM (3).jpeg",
    "WhatsApp Image 2026-04-06 at 3.07.20 PM.jpeg"
  ];

  const categories = [
    { name: 'Hampers', price: [599, 799], title: 'Luxury Wellness Hamper' },
    { name: 'Frames', price: [299, 499], title: 'Aesthetic Oak Frame' },
    { name: 'Collage', price: [399, 649], title: 'Endless Memories Collage' },
    { name: 'Bouquet', price: [449, 749], title: 'Eternal Rose Bouquet' },
    { name: 'Miniatures', price: [199, 399], title: 'Personalized Initial Charm' }
  ];

  try {
    console.log('⏳ Connecting to Database...');
    await client.connect();
    
    console.log('🧹 Clearing all tables...');
    await client.query('TRUNCATE TABLE "OrderItem", "Order", "Product", "Contact" RESTART IDENTITY CASCADE;');

    console.log('🚀 Injecting 85 products...');
    
    // Build values string for bulk insert
    const valuesList = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const cat = categories[i % categories.length];
      const price = Math.floor(Math.random() * (cat.price[1] - cat.price[0] + 1)) + cat.price[0];
      const id = `prod_${i + 1}`;
      valuesList.push(`('${id}', '${cat.title} #${i+1}', 'Premium handcrafted creation by The Memory Knot.', ${price}, '/images/${imageFiles[i]}', '${cat.name}', ${i % 5 === 0}, false, NOW())`);
    }

    const query = `
      INSERT INTO "Product" (id, name, description, price, image, category, featured, "isSoldOut", "createdAt")
      VALUES ${valuesList.join(',')};
    `;

    await client.query(query);
    console.log('✅ 85 Products Added Successfully!');

  } catch (err) {
    console.error('❌ Error during refresh:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

fastRefresh();
