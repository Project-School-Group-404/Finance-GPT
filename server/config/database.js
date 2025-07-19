import { PrismaClient } from '@prisma/client';

// Create a singleton instance of Prisma Client
let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    // In development, use global variable to prevent multiple instances
    if (!global.__prisma) {
        global.__prisma = new PrismaClient();
    }
    prisma = global.__prisma;
}

export default prisma;
