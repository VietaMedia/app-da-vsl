import { requireUser } from '@/lib/auth';
import { getPerfil, salvarPerfil } from '@/lib/dados/perfil';
import { validarCorpo, aplicarQuiz } from '@/lib/perfil-api';
import { getContent } from '@/lib/content';
import { hojeISO } from '@/lib/dates';
import { lerJson, erroInterno } from '@/lib/http';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const u = await requireUser();
    return Response.json(await getPerfil(u.id));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}

export async function PUT(req) {
  try {
    const u = await requireUser();
    const body = await lerJson(req);
    const { dados, erro } = validarCorpo(body, hojeISO());
    if (erro) return Response.json({ error: erro }, { status: 400 });
    if (dados.answers) {
      const content = await getContent();
      const quizModule = content.modules.find(m => m.type === 'quiz');
      // O perfil que o cliente manda em `answers.perfil` é só um palpite —
      // recalculamos aqui a partir das respostas de quiz, nunca confiamos no
      // valor recebido.
      const { answers, erro: erroQuiz } = aplicarQuiz(dados.answers, quizModule);
      if (erroQuiz) return Response.json({ error: erroQuiz }, { status: 400 });
      dados.answers = answers;
    }
    await salvarPerfil(u.id, dados);
    return Response.json(await getPerfil(u.id));
  } catch (e) { return e instanceof Response ? e : erroInterno(e); }
}
