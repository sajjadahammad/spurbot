import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * Database Adapter Configuration
 * 
 * Current: Neon (serverless PostgreSQL) - Recommended for serverless deployments
 * To switch to regular PostgreSQL:
 * 1. Comment out the Neon imports above
 * 2. Uncomment the PostgreSQL imports below
 * 3. Update the adapter initialization in createPrismaClient()
 * 4. Make sure @prisma/adapter-pg and pg are installed: npm install @prisma/adapter-pg pg
 */

// Alternative: For regular PostgreSQL (not Neon), use this instead:
// import { PrismaPg } from "@prisma/adapter-pg";
// import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Neon adapter (current implementation)
  const adapter = new PrismaNeon({ connectionString });

  // Alternative: For regular PostgreSQL, use this instead:
  // const pool = new Pool({
  //   connectionString,
  // });
  // const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const db =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}