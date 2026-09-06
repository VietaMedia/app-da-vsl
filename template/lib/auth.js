import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma, ensureSchema } from './db/prisma';
import { segredoSessao } from './segredo';
const COOKIE = 'sessao';
const secret = () => new TextEncoder().encode(segredoSessao());
export const normalizarEmail = s => (s || '').toLowerCase().trim();
export async function signToken(payload) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('90d').sign(secret());
}
export async function verifyToken(token) {
  try { return (await jwtVerify(token, secret())).payload; } catch { return null; }
}
export async function setSessionCookie(user) {
  const token = await signToken({ id: user.id, email: user.email, role: user.role });
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 90 });
}
export async function clearSessionCookie() { (await cookies()).delete(COOKIE); }
export async function getSession() {
  const t = (await cookies()).get(COOKIE)?.value;
  return t ? verifyToken(t) : null;
}
export async function requireUser() {
  const s = await getSession();
  if (!s) throw Response.json({ error: 'não autenticado' }, { status: 401 });
  await ensureSchema();
  const u = await prisma.user.findUnique({ where: { id: s.id } });
  if (!u || u.status !== 'ativo') throw Response.json({ error: 'acesso bloqueado' }, { status: 403 });
  return u;
}
export async function requireOwner() {
  const u = await requireUser();
  if (u.role !== 'owner') throw Response.json({ error: 'só o dono' }, { status: 403 });
  return u;
}
export async function ensureOwner() {
  const email = process.env.OWNER_EMAIL;
  if (!email) return;
  await ensureSchema();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (!exists) { await prisma.user.create({ data: { email, role: 'owner' } }); return; }
  if (exists.role !== 'owner') {
    await prisma.user.update({ where: { email }, data: { role: 'owner', status: 'ativo' } });
  }
}
