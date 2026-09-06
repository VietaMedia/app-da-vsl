'use client';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import Icone from '@/components/ui/Icone';
import Checkbox from '@/components/ui/Checkbox';
import Chip from '@/components/ui/Chip';
import { indicesPorSecao, resumoLista, estimativaTexto } from '@/lib/modulos/guias';
import { t } from '@/lib/i18n';

// Guia tipo "lista" (mockup Guia.dc.html): cartão-resumo com gradiente, chips
// de seção e um cartão por seção com checkbox + quantidade por item. Toggle
// otimista via /api/modulos/guias/marcar, com reversão se a chamada falhar.
export default function GuiaLista({ moduleKey, guide, marcadosIniciais, locale = 'pt' }) {
  const [marcados, setMarcados] = useState(new Set(marcadosIniciais));
  const [erro, setErro] = useState(null);
  const [secaoAtiva, setSecaoAtiva] = useState(0);
  const reduzida = useReducedMotion();
  const indices = indicesPorSecao(guide);
  const resumo = resumoLista(guide, [...marcados]);
  const estimativa = estimativaTexto(guide);
  const refsSecoes = useRef([]);
  const refChipAtivo = useRef(null);

  // Chip ativo acompanha qual seção está visível ao rolar a página (não só o
  // clique): observa o topo de cada cartão de seção, com uma margem que
  // considera "ativa" a seção assim que passa de ~40% do topo da tela.
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visivel = entries.find(e => e.isIntersecting);
        if (visivel) {
          const i = Number(visivel.target.dataset.secaoIndex);
          setSecaoAtiva(i);
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    refsSecoes.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [guide.sections.length]);

  useEffect(() => {
    refChipAtivo.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduzida ? 'auto' : 'smooth' });
  }, [secaoAtiva, reduzida]);

  function irParaSecao(i) {
    setSecaoAtiva(i);
    refsSecoes.current[i]?.scrollIntoView({ behavior: reduzida ? 'auto' : 'smooth', block: 'start' });
  }

  async function alternar(itemIndex) {
    const anterior = new Set(marcados);
    const proximo = new Set(marcados);
    if (proximo.has(itemIndex)) proximo.delete(itemIndex); else proximo.add(itemIndex);
    setMarcados(proximo);
    try {
      const res = await fetch('/api/modulos/guias/marcar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey, guideKey: guide.key, itemIndex }),
      });
      if (!res.ok) throw new Error(t(locale, 'erro.falhaMarcarItem'));
      setErro(null);
    } catch (e) {
      setMarcados(anterior);
      setErro(e.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {erro && <p style={{ color: '#B3261E', fontSize: 13 }}>{erro}</p>}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 18,
        background: 'linear-gradient(135deg, var(--cor-primaria-escura), var(--cor-primaria))', color: '#fff',
      }}>
        <Icone nome="cart" tamanho={24} cor="#fff" traco={1.8} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{guide.title}</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            {resumo.total} {t(locale, resumo.total === 1 ? 'kit.item' : 'kit.itens')}
            {estimativa && ` · ${estimativa}`}
            {' · '}{t(locale, 'kit.nDeN', { n: resumo.marcados, total: resumo.total })} {t(locale, 'kit.noCarrinho')}
          </div>
        </div>
      </div>

      <div className="chips-semanas" style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {guide.sections.map((secao, i) => (
          <div key={i} ref={i === secaoAtiva ? refChipAtivo : undefined}>
            <Chip ativo={i === secaoAtiva} onClick={() => irParaSecao(i)}>{secao.title}</Chip>
          </div>
        ))}
      </div>

      {guide.sections.map((secao, i) => (
        <div
          key={i}
          ref={el => { refsSecoes.current[i] = el; }}
          data-secao-index={i}
          id={`secao-${i}`}
          className="card"
          style={{ padding: 16, scrollMarginTop: 70 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="display" style={{ fontSize: 20, fontWeight: 700 }}>{secao.title}</div>
            {secao.tag && <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--cor-primaria)' }}>{secao.tag}</div>}
          </div>
          {secao.items.map((item, j) => {
            const itemIndex = indices[i][j];
            const marcado = marcados.has(itemIndex);
            const ultimo = j === secao.items.length - 1;
            return (
              <div key={j} style={{ borderBottom: ultimo ? 'none' : '1px solid var(--cor-linha)' }}>
                <Checkbox
                  marcado={marcado}
                  onChange={() => alternar(itemIndex)}
                  label={item.name}
                  extra={item.qty}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
