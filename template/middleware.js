import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { segredoSessao } from './lib/segredo';
export async function middleware(req) {
  let secretValue;
  try { secretValue = segredoSessao(); }
  catch {
    return new NextResponse('Serviço indisponível: variável de ambiente SESSION_SECRET ausente ou curta.', { status: 503 });
  }
  const secret = new TextEncoder().encode(secretValue);
  const token = req.cookies.get('sessao')?.value;
  let payload = null;
  if (token) { try { payload = (await jwtVerify(token, secret)).payload; } catch {} }
  const { pathname } = req.nextUrl;
  if (!payload) return NextResponse.redirect(new URL('/entrar', req.url));
  if (pathname.startsWith('/painel') && payload.role !== 'owner') return NextResponse.redirect(new URL('/app', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/app/:path*', '/painel/:path*'] };
