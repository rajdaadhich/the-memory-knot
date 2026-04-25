const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🛡️  Seeding admins...');
  
  await prisma.admin.deleteMany();

  const passwordHash = await bcrypt.hash('14032004', 10);

  const admins = [
    { username: 'Admin1', email: 'prekshakhandelwal6671@gmail.com', password: passwordHash },
    { username: 'Admin2', email: 'dadhichr260@gmail.com', password: passwordHash },
  ];

  for (const adminData of admins) {
    await prisma.admin.create({ data: adminData });
    console.log(`✅ Created admin: ${adminData.username} (${adminData.email})`);
  }

  console.log('✨ Admin seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
