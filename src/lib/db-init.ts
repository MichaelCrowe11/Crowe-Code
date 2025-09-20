import { prisma } from './database';

export async function initializeDatabase() {
  try {
    // Try to connect and create basic tables
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT,
        "firstName" TEXT,
        "lastName" TEXT,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "emailVerified" TIMESTAMP,
        "image" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "sessionToken" TEXT UNIQUE NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP NOT NULL,
        CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `;

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't throw - let the app continue
  }
}