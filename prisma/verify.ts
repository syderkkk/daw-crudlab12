/**
 * Verification script for Biblioteca Lab foundation
 * Checks: schema valid, client generated, models exist
 */
import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

async function verify() {
  console.log("=== Biblioteca Lab Foundation Verification ===\n");

  // 1. Check PrismaClient can be constructed
  try {
    const adapter = new PrismaPg({ connectionString: "postgresql://test:test@localhost:5432/test" });
    const prisma = new PrismaClient({ adapter });
    console.log("✅ PrismaClient instantiates with adapter");

    // 2. Check models exist on client
    const authorModel = (prisma as any).author;
    const bookModel = (prisma as any).book;

    if (authorModel) {
      console.log("✅ Author model available on PrismaClient");
    } else {
      console.error("❌ Author model NOT found on PrismaClient");
      process.exit(1);
    }

    if (bookModel) {
      console.log("✅ Book model available on PrismaClient");
    } else {
      console.error("❌ Book model NOT found on PrismaClient");
      process.exit(1);
    }

    // 3. Check methods exist
    const authorMethods = ["findMany", "create", "delete", "update"];
    for (const method of authorMethods) {
      if (typeof authorModel[method] === "function") {
        console.log(`✅ Author.${method}() available`);
      } else {
        console.error(`❌ Author.${method}() NOT found`);
        process.exit(1);
      }
    }

    const bookMethods = ["findMany", "create", "delete", "update"];
    for (const method of bookMethods) {
      if (typeof bookModel[method] === "function") {
        console.log(`✅ Book.${method}() available`);
      } else {
        console.error(`❌ Book.${method}() NOT found`);
        process.exit(1);
      }
    }

    await prisma.$disconnect();
    console.log("\n=== All verifications passed ===");
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

verify();
