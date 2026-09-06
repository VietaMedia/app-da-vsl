'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import Icone from '@/components/ui/Icone';
import Botao from '@/components/ui/Botao';
import Esqueleto from '@/components/ui/Esqueleto';
import Anel from '@/components/ui/Anel';
import Markdown from '@/components/ui/Markdown';
import { validarPasso, resultadoAvaliacao, paraNumero } from '@/lib/avaliacao';
import { calcularPerfil } from '@/lib/quiz-puro';
import { hojeISO, localeIntl } from '@/lib/dates';
import { t } from '@/lib/i18n';

const DURACAO_CARREGANDO = 1.4; // segundos

const passoNumerico = input => (Number.isInteger(input.default) ? 1 : 0.5);

// Assistente de onboarding guiado: [nome] → inputs da calculadora (se houver)
// → perguntas do quiz (se houver; opções viram botões, avança sozinho ao
// tocar) → carregando → resultado (cálculo e/ou perfil de quiz).
export default function Assistente({ calculadora, quiz, perfil, refazer, locale = 'pt' }) {
  const router = useRouter();
  const reduzida = useReducedMotion();
  const inputs = calculadora?.content?.inputs || [];
  const perguntas = quiz?.content?.questions || [];
  const totalCalc = inputs.length;
  const totalQuiz = perguntas.length;
  const totalPerguntas = 1 + totalCalc + totalQuiz; // nome + inputs + perguntas do quiz
  const PASSO_CARREGANDO = totalPerguntas;
  const PASSO_RESULTADO = totalPerguntas + 1;
  const ULTIMO_PASSO_DE_PERGUNTA = totalCalc + totalQuiz;

  const [passo, setPasso] = useState(0);
  const [direcao, setDirecao] = useState(1);
  const [name, setName] = useState(perfil?.name || '');
  const [answers, setAnswers] = useState(() => {
    const iniciais = {};
    for (const inp of inputs) iniciais[inp.key] = perfil?.answers?.[inp.key] ?? inp.default ?? 0;
    return iniciais;
  });
  const [quizAnswers, setQuizAnswers] = useState(() => {
    const iniciais = {};
    for (const q of perguntas) {
      const valor = perfil?.answers?.[`quiz:${q.key}`];
      if (valor !== undefined) iniciais[q.key] = valor;
    }
    return iniciais;
  });
  const [ajustesAberto, setAjustesAberto] = useState(() => !calculadora);
  const [campo, setCampo] = useState('');
  const [erro, setErro] = useState('');
  const [progressoAnel, setProgressoAnel] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');

  const inputAtual = passo >= 1 && passo <= totalCalc ? inputs[passo - 1] : null;
  const perguntaAtual = passo > totalCalc && passo <= ULTIMO_PASSO_DE_PERGUNTA ? perguntas[passo - totalCalc - 1] : null;

  useEffect(() => {
    if (inputAtual) setCampo(String(answers[inputAtual.key] ?? ''));
    setErro('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo]);

  useEffect(() => {
    if (passo !== PASSO_CARREGANDO) return;
    if (reduzida) {
      setProgressoAnel(100);
      setPasso(PASSO_RESULTADO);
      return;
    }
    const subir = setTimeout(() => setProgressoAnel(100), 30);
    const avancar = setTimeout(() => { setDirecao(1); setPasso(PASSO_RESULTADO); }, DURACAO_CARREGANDO * 1000);
    return () => { clearTimeout(subir); clearTimeout(avancar); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo]);

  const resultado = useMemo(() => {
    if (passo !== PASSO_RESULTADO) return null;
    let calc = null;
    if (calculadora) {
      try { calc = resultadoAvaliacao(calculadora, answers); } catch (e) { return { erro: e.message }; }
    }
    let perfilResultado = null;
    if (quiz) {
      const { perfilKey } = calcularPerfil(quiz.content, quizAnswers);
      perfilResultado = quiz.content.profiles.find(p => p.key === perfilKey) || null;
    }
    return { calc, perfil: perfilResultado };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo]);

  const metaInput = calculadora?.content?.goalInput ? inputs.find(i => i.key === calculadora.content.goalInput) : null;

  function ir(proximo) {
    setDirecao(proximo > passo ? 1 : -1);
    setPasso(proximo);
  }

  function voltar() {
    if (passo === 0) return;
    if (passo === PASSO_RESULTADO) { ir(ULTIMO_PASSO_DE_PERGUNTA); return; }
    ir(passo - 1);
  }

  function continuarNome(e) {
    e?.preventDefault?.();
    const nome = name.trim();
    if (nome.length < 2) { setErro(t(locale, 'onboarding.erroNome')); return; }
    setErro('');
    ir(1);
  }

  function avancarDeQuestao() {
    if (passo < ULTIMO_PASSO_DE_PERGUNTA) ir(passo + 1);
    else { setProgressoAnel(0); ir(PASSO_CARREGANDO); }
  }

  function continuarInput(e) {
    e?.preventDefault?.();
    const r = validarPasso(inputAtual, campo);
    if (!r.ok) { setErro(r.erro); return; }
    setAnswers(a => ({ ...a, [inputAtual.key]: r.valor }));
    setErro('');
    avancarDeQuestao();
  }

  function selecionarOpcao(optKey) {
    setQuizAnswers(a => ({ ...a, [perguntaAtual.key]: optKey }));
    if (reduzida) avancarDeQuestao();
    else setTimeout(avancarDeQuestao, 250);
  }

  function alterarCampo(delta) {
    const passoNum = passoNumerico(inputAtual);
    const atual = paraNumero(campo);
    const base = Number.isFinite(atual) ? atual : (inputAtual.default ?? 0);
    const novo = Math.round((base + delta * passoNum) * 100) / 100;
    setCampo(String(novo));
  }

  async function comecarProtocolo() {
    setEnviando(true);
    setErroEnvio('');
    try {
      const respostasQuizPrefixadas = {};
      for (const [qKey, optKey] of Object.entries(quizAnswers)) respostasQuizPrefixadas[`quiz:${qKey}`] = optKey;
      const corpo = {
        name: name.trim(),
        answers: { ...answers, ...respostasQuizPrefixadas },
        startDate: perfil?.startDate ?? hojeISO(),
        onboardingDone: true,
      };
      if (resultado?.calc?.goal !== undefined) corpo.goal = resultado.calc.goal;
      if (resultado?.perfil) corpo.answers.perfil = resultado.perfil.key;
      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErroEnvio(body.error || t(locale, 'onboarding.erroSalvar'));
        setEnviando(false);
        return;
      }
      router.push('/app');
    } catch {
      setErroEnvio(t(locale, 'onboarding.erroSalvarConexao'));
      setEnviando(false);
    }
  }

  const mostrarProgresso = passo <= ULTIMO_PASSO_DE_PERGUNTA;
  // voltar aparece em todos os passos, exceto o primeiro e a tela de carregamento (que avança sozinha)
  const mostrarVoltar = passo > 0 && passo !== PASSO_CARREGANDO;

  return (
    <div
      className="mx-auto flex w-full max-w-[430px] flex-col"
      style={{ background: 'var(--cor-fundo)', minHeight: '100dvh', padding: '24px 22px calc(24px + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center gap-3">
        {mostrarVoltar ? (
          <button type="button"
            onClick={voltar}
            aria-label={t(locale, 'onboarding.voltarAria')}
            style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cor-superficie)', border: '1px solid var(--cor-linha)', flexShrink: 0 }}
          >
            <Icone nome="back" tamanho={20} cor="var(--cor-texto)" traco={2.2} />
          </button>
        ) : (
          <div style={{ width: 44, height: 44, flexShrink: 0 }} />
        )}
        {mostrarProgresso ? (
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'var(--cor-superficie)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%', borderRadius: 999, background: 'var(--cor-destaque)',
                width: `${((passo + 1) / totalPerguntas) * 100}%`,
                transition: reduzida ? 'none' : 'width 250ms ease-out',
              }}
            />
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}
        <div style={{ width: 44, height: 44, flexShrink: 0 }} />
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden pb-6 pt-6">
        <AnimatePresence mode="wait" initial={false} custom={direcao}>
          {passo === 0 && (
            <PassoTransicao key="nome" direcao={direcao} reduzida={reduzida}>
              <form className="flex flex-1 flex-col" onSubmit={continuarNome}>
                <div className="flex flex-col gap-6" style={{ marginTop: 40 }}>
                  <div>
                    {refazer && (
                      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--cor-primaria)', marginBottom: 6 }}>
                        {t(locale, 'onboarding.refazendoAvaliacao')}
                      </div>
                    )}
                    <h1 className="display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15, color: 'var(--cor-texto)' }}>
                      {t(locale, 'onboarding.comoChamar')}
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--cor-texto-suave)', marginTop: 8 }}>
                      {t(locale, 'onboarding.comoChamarSub')}
                    </p>
                  </div>
                  <div>
                    <input
                      autoFocus
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t(locale, 'onboarding.nomePlaceholder')}
                      style={{ width: '100%', height: 56, borderRadius: 'var(--raio)', border: '1.5px solid var(--cor-linha)', padding: '0 18px', fontSize: 17, background: 'var(--cor-superficie)', color: 'var(--cor-texto)' }}
                    />
                    {erro && <p style={{ color: '#b3261e', fontSize: 14, marginTop: 8 }}>{erro}</p>}
                  </div>
                </div>
                <Botao type="submit" className="mt-auto">{t(locale, 'onboarding.continuar')}</Botao>
              </form>
            </PassoTransicao>
          )}

          {inputAtual && (
            <PassoTransicao key={`input-${inputAtual.key}`} direcao={direcao} reduzida={reduzida}>
              <form className="flex flex-1 flex-col" onSubmit={continuarInput}>
                <div className="flex flex-col gap-8" style={{ marginTop: 40 }}>
                  <h1 className="display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15, color: 'var(--cor-texto)' }}>
                    {inputAtual.label}
                  </h1>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => alterarCampo(-1)}
                      aria-label={t(locale, 'onboarding.diminuirAria')}
                      style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cor-superficie)', border: '1px solid var(--cor-linha)', flexShrink: 0 }}
                    >
                      <Icone nome="minus" tamanho={20} cor="var(--cor-texto)" traco={2.4} />
                    </button>
                    <div
                      style={{
                        height: 64, minWidth: 140, borderRadius: 'var(--raio)', background: 'var(--cor-superficie)',
                        border: '1.5px solid var(--cor-linha)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 16px',
                      }}
                    >
                      <input
                        inputMode="decimal"
                        value={campo}
                        onChange={e => setCampo(e.target.value)}
                        className="display"
                        style={{ width: '100%', textAlign: 'center', fontSize: 32, fontWeight: 700, background: 'transparent', border: 'none', outline: 'none', color: 'var(--cor-texto)' }}
                      />
                      {inputAtual.unit && <span style={{ fontSize: 18, color: 'var(--cor-texto-suave)', fontWeight: 600 }}>{inputAtual.unit}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => alterarCampo(1)}
                      aria-label={t(locale, 'onboarding.aumentarAria')}
                      style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cor-superficie)', border: '1px solid var(--cor-linha)', flexShrink: 0 }}
                    >
                      <Icone nome="plus" tamanho={20} cor="var(--cor-texto)" traco={2.4} />
                    </button>
                  </div>
                  {erro && <p style={{ color: '#b3261e', fontSize: 14, textAlign: 'center' }}>{erro}</p>}
                </div>
                <Botao type="submit" className="mt-auto">{t(locale, 'onboarding.continuar')}</Botao>
              </form>
            </PassoTransicao>
          )}

          {perguntaAtual && (
            <PassoTransicao key={`quiz-${perguntaAtual.key}`} direcao={direcao} reduzida={reduzida}>
              <div className="flex flex-1 flex-col">
                <div className="flex flex-col gap-6" style={{ marginTop: 40 }}>
                  <h1 className="display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15, color: 'var(--cor-texto)' }}>
                    {perguntaAtual.text}
                  </h1>
                  <div className="flex flex-col gap-3">
                    {perguntaAtual.options.map(opt => {
                      const selecionada = quizAnswers[perguntaAtual.key] === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => selecionarOpcao(opt.key)}
                          style={{
                            minHeight: 56, borderRadius: 'var(--raio)', padding: '14px 18px', textAlign: 'left',
                            fontSize: 16, fontWeight: 700, color: 'var(--cor-texto)', cursor: 'pointer',
                            border: `1.5px solid ${selecionada ? 'var(--cor-primaria)' : 'var(--cor-linha)'}`,
                            background: selecionada ? 'rgba(var(--cor-primaria-rgb), .1)' : 'var(--cor-superficie)',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </PassoTransicao>
          )}

          {passo === PASSO_CARREGANDO && (
            <PassoTransicao key="carregando" direcao={direcao} reduzida={reduzida}>
              <div className="flex flex-1 flex-col items-center gap-8 text-center" style={{ marginTop: 40 }}>
                <Anel valor={progressoAnel} total={100} tamanho={110} rotulo="%" duracao={DURACAO_CARREGANDO} />
                <div>
                  <h1 className="display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--cor-texto)' }}>
                    {t(locale, 'onboarding.carregandoTitulo')}
                  </h1>
                  <p style={{ fontSize: 15, color: 'var(--cor-texto-suave)', marginTop: 8 }}>
                    {t(locale, 'onboarding.carregandoSub')}
                  </p>
                </div>
                <Esqueleto linhas={3} className="w-full" />
              </div>
            </PassoTransicao>
          )}

          {passo === PASSO_RESULTADO && resultado && (
            <PassoTransicao key="resultado" direcao={direcao} reduzida={reduzida}>
              <div className="flex flex-1 flex-col gap-6" style={{ marginTop: 24 }}>
                {resultado.erro ? (
                  <>
                    <p style={{ color: '#b3261e', fontSize: 15 }}>{resultado.erro}</p>
                    <Botao variante="secundario" onClick={voltar}>{t(locale, 'onboarding.voltarERevisar')}</Botao>
                  </>
                ) : (
                  <>
                    {resultado.calc && (
                      <>
                        <div className="text-center">
                          <div className="display" style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, color: 'var(--cor-primaria)' }}>
                            {resultado.calc.result.toLocaleString(localeIntl(locale), { maximumFractionDigits: 2 })}
                            <span style={{ fontSize: 26, marginLeft: 4 }}>{calculadora.content.resultUnit}</span>
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cor-texto-suave)', marginTop: 6 }}>
                            {calculadora.content.resultLabel}
                          </div>
                        </div>
                        <p style={{ fontSize: 15, color: 'var(--cor-texto)', lineHeight: 1.5 }}>{resultado.calc.texto}</p>
                        {metaInput && resultado.calc.goal !== undefined && (
                          <div style={{ background: 'var(--cor-superficie)', border: '1px solid var(--cor-linha)', borderRadius: 'var(--raio)', padding: '14px 18px' }}>
                            <span style={{ fontSize: 15, color: 'var(--cor-texto)' }}>
                              {t(locale, 'onboarding.suaMeta')}: <strong>{resultado.calc.goal} {metaInput.unit}</strong>
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {resultado.perfil && (
                      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--cor-primaria)' }}>
                          {resultado.perfil.title}
                        </div>
                        <p style={{ fontSize: 15, color: 'var(--cor-texto)', lineHeight: 1.5 }}>{resultado.perfil.description}</p>
                        <button
                          type="button"
                          onClick={() => setAjustesAberto(a => !a)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: 'flex-start',
                            fontSize: 14, fontWeight: 800, color: 'var(--cor-primaria)', background: 'none', border: 'none', cursor: 'pointer',
                          }}
                        >
                          {ajustesAberto ? t(locale, 'onboarding.ocultarAjustes') : t(locale, 'onboarding.verAjustes')}
                          <Icone
                            nome="chev" tamanho={16} cor="var(--cor-primaria)" traco={2.4}
                            style={{ transform: ajustesAberto ? 'rotate(90deg)' : 'none', transition: reduzida ? 'none' : 'transform 200ms ease-out' }}
                          />
                        </button>
                        {ajustesAberto && (
                          <div style={{ fontSize: 15, lineHeight: 1.5 }}>
                            <Markdown text={resultado.perfil.ajustes} />
                          </div>
                        )}
                      </div>
                    )}
                    {erroEnvio && <p style={{ color: '#b3261e', fontSize: 14 }}>{erroEnvio}</p>}
                    <Botao onClick={comecarProtocolo} carregando={enviando} className="mt-auto">{t(locale, 'onboarding.comecarProtocolo')}</Botao>
                  </>
                )}
              </div>
            </PassoTransicao>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PassoTransicao({ children, direcao, reduzida }) {
  return (
    <motion.div
      className="flex flex-1 flex-col"
      custom={direcao}
      initial={reduzida ? false : { opacity: 0, x: direcao * 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduzida ? { opacity: 1 } : { opacity: 0, x: -direcao * 16 }}
      transition={{ duration: reduzida ? 0 : 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
