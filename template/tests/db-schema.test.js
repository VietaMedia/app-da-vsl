import { test, expect } from 'vitest';
import { DDL } from '@/lib/db/schema';
test('8 statements: 7 CREATE TABLE IF NOT EXISTS + 1 ALTER', () => {
  expect(DDL.length).toBe(8);
  for (const sql of DDL.slice(0, 7)) expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS/);
  expect(DDL[7]).toMatch(/ALTER TABLE/);
});
test('tabelas batem com os modelos do prisma', () => {
  for (const t of ['User', 'Setting', 'Checkin', 'Measurement', 'Progress', 'Profile', 'Note']) {
    expect(DDL.join(' ')).toContain('`' + t + '`');
  }
});
