import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing connection...");
  try {
    const start = Date.now();
    const count = await prisma.product.count();
    console.log(`Successfully fetched count: ${count} in ${Date.now() - start}ms`);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
