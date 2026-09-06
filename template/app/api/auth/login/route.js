import { prisma, ensureSchema } from '@/lib/db/prisma';
import { setSessionCookie, ensureOwner, normalizarEmail } from '@/lib/auth';
import { chaveDoRequest, permitir } from '@/lib/limite';
import { getPerfil, perfilPronto } from '@/lib/dados/perfil';
import { getContent } from '@/lib/content';
import { podeEntrar, exigePin, pinConfere } from '@/lib/acesso';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  try {
    const chave = chaveDoRequest(req, 'login');
    if (!permitir(chave, { max: 20 })) return Response.json({ error: 'muitas tentativas, aguarde alguns minutos' }, { status: 429 });
    const { email, pin } = await lerJson(req);
    const e = normalizarEmail(email);
    if (!/^\S+@\S+\.\S+$/.test(e)) return Response.json({ error: 'digite um e-mail válido' }, { status: 400 });

    const ownerEmail = normalizarEmail(process.env.OWNER_EMAIL);
    const ownerPin = process.env.OWNER_PIN;
    if (exigePin({ email: e, ownerEmail, ownerPin })) {
      if (!pin) return Response.json({ error: 'este e-mail precisa do PIN do dono', precisaPin: true }, { status: 401 });
      if (!pinConfere(pin, ownerPin)) return Response.json({ error: 'PIN incorreto', precisaPin: true }, { status: 401 });
    }

    await ensureSchema(); await ensureOwner();
    let user = await prisma.user.findUnique({ where: { email: e } });
    const decisao = podeEntrar({ existente: user, acessoFechado: process.env.ACESSO_FECHADO === '1' });
    if (decisao === 'recusar') {
      return Response.json({ error: 'este e-mail não está na lista de compradores. Use o e-mail da sua compra ou fale com o suporte.' }, { status: 403 });
    }
    if (decisao === 'criar') user = await prisma.user.create({ data: { email: e } });
    if (user.status !== 'ativo') return Response.json({ error: 'seu acesso está bloqueado. Fale com o suporte.' }, { status: 403 });
    await setSessionCookie(user);
    const perfil = await getPerfil(user.id);
    return Response.json({ ok: true, role: user.role, onboardingPendente: !perfilPronto(perfil, await getContent()) });
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
