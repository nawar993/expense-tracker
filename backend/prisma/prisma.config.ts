import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config(); // لتحميل المتغيرات من .env

// إنشاء Prisma Client
export const prisma = new PrismaClient();