import crypto from 'node:crypto';
import { prisma, ensureSchema } from '@/lib/db/prisma';
import { decidirLiberacao } from '@/lib/acesso';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';

function tokenValido(header) {
  const esperado = process.env.ACCESS_TOKEN;
  if (!esperado) return null; // sinaliza "não configurado"
  const recebido = (header || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req) {
  try {
    const check = tokenValido(req.headers.get('authorization'));
    if (check === null) return Response.json({ error: 'ACCESS_TOKEN não configurado' }, { status: 503 });
    if (!check) return Response.json({ error: 'token inválido' }, { status: 401 });

    const body = await lerJson(req);
    const email = (body.email || '').toLowerCase().trim();
    const status = body.status || 'ativo';
    if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: 'e-mail inválido' }, { status: 400 });
    if (status !== 'ativo' && status !== 'bloqueado') return Response.json({ error: 'status inválido' }, { status: 400 });

    await ensureSchema();
    const existente = await prisma.user.findUnique({ where: { email } });
    const ownerEmail = (process.env.OWNER_EMAIL || '').toLowerCase().trim();
    const ehDono = (!!ownerEmail && email === ownerEmail) || existente?.role === 'owner';
    const acao = decidirLiberacao(existente, status, ehDono);

    if (acao === 'protegido') {
      return Response.json({ ok: false, acao: 'protegido', error: 'a conta do dono não pode ser alterada por este endpoint' });
    }

    if (acao === 'atualizar') {
      await prisma.user.update({ where: { email }, data: { status } });
    } else if (acao === 'criar') {
      await prisma.user.create({ data: { email, status: 'ativo' } });
    }
    // 'ignorar': nada a fazer

    return Response.json({ ok: true, acao });
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
