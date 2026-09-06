import { PrismaClient } from '@prisma/client';
import { DDL } from './schema';
const g = globalThis;
export const prisma = g.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.__prisma = prisma;
let ready = null;
export function ensureSchema() {
  if (!ready) ready = (async () => { for (const sql of DDL) await prisma.$executeRawUnsafe(sql); })().catch(e => { ready = null; throw e; });
  return ready;
}
