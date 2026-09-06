'use client';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { MOODS, SYMBOLS, ILLUSTRATIONS } from '@/lib/schemas';
import { SIMBOLOS } from '@/lib/identidade/simbolos';

const ROTULOS_CLIMA = {
  natural: 'Natural e acolhedor',
  clinico: 'Clínico e limpo',
  fitness: 'Energia e movimento',
  financeiro: 'Sóbrio e confiável',
  beleza: 'Suave e elegante',
  foco: 'Calmo e focado',
};

async function salvarOverride(key, value) {
  const r = await fetch('/api/painel/conteudo', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  const dados = await r.json();
  return { ok: r.ok, dados };
}

async function removerOverride(key) {
  const r = await fetch('/api/painel/conteudo', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  const dados = await r.json();
  return { ok: r.ok, dados };
}

function AparenciaForm({ config, overrides, recarregar }) {
  const override = overrides['content:theme'];
  const atual = { ...config.theme, ...override };
  const [valores, setValores] = useState({ primary: atual.primary, accent: atual.accent, background: atual.background });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro(''); setSalvando(true);
    const { ok, dados } = await salvarOverride('content:theme', valores);
    setSalvando(false);
    if (!ok) { setErro(dados.error || 'erro ao salvar'); return; }
    recarregar();
  }

  async function voltarAoPadrao() {
    setErro(''); setSalvando(true);
    const { ok, dados } = await removerOverride('content:theme');
    setSalvando(false);
    if (!ok) { setErro(dados.error || 'erro ao voltar ao padrão'); return; }
    recarregar();
  }

  return (
    <Card className="space-y-3">
      <h2 className="display text-lg font-semibold" style={{ color: 'var(--cor-texto)' }}>Aparência</h2>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm" style={{ color: 'var(--cor-texto-suave)' }}>
          Cor primária
          <input
            type="color"
            value={valores.primary}
            onChange={e => setValores(v => ({ ...v, primary: e.target.value }))}
            style={{ width: 56, height: 44, borderRadius: 10, border: '1.5px solid var(--cor-linha)', padding: 2 }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" style={{ color: 'var(--cor-texto-suave)' }}>
          Cor de destaque
          <input
            type="color"
            value={valores.accent}
            onChange={e => setValores(v => ({ ...v, accent: e.target.value }))}
            style={{ width: 56, height: 44, borderRadius: 10, border: '1.5px solid var(--cor-linha)', padding: 2 }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" style={{ color: 'var(--cor-texto-suave)' }}>
          Cor de fundo
          <input
            type="color"
            value={valores.background}
            onChange={e => setValores(v => ({ ...v, background: e.target.value }))}
            style={{ width: 56, height: 44, borderRadius: 10, border: '1.5px solid var(--cor-linha)', padding: 2 }}
          />
        </label>
        <div
          aria-hidden
          style={{
            flex: 1,
            minWidth: 160,
            height: 44,
            borderRadius: 10,
            border: '1.5px solid var(--cor-linha)',
            background: valores.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '0 10px',
          }}
        >
          <span style={{ width: 22, height: 22, borderRadius: 6, background: valores.primary }} />
          <span style={{ width: 22, height: 22, borderRadius: 6, background: valores.accent }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: valores.primary }}>Pré-visualização</span>
        </div>
      </div>
      <p className="text-xs" style={{ color: 'var(--cor-texto-suave)' }}>
        Confira se o texto continua legível sobre o fundo.
      </p>
      {erro && <p className="text-sm" style={{ color: '#C0392B' }}>{erro}</p>}
      <div className="flex gap-2">
        <Button onClick={salvar} disabled={salvando}>Salvar aparência</Button>
        {override && (
          <button
            onClick={voltarAoPadrao}
            disabled={salvando}
            className="rounded-xl border px-3 py-3 font-semibold disabled:opacity-50"
            style={{ borderColor: 'var(--cor-linha)', color: 'var(--cor-texto)' }}
          >
            Voltar ao padrão
          </button>
        )}
      </div>
    </Card>
  );
}

function IdentidadeForm({ config, overrides, recarregar }) {
  const override = overrides['content:identity'];
  const atual = {
    ...config.identity,
    ...override,
    icon: { ...config.identity.icon, ...(override?.icon || {}) },
  };
  const [mood, setMood] = useState(atual.mood);
  const [symbol, setSymbol] = useState(atual.icon.symbol);
  const [illustration, setIllustration] = useState(atual.illustration);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro(''); setSalvando(true);
    const { ok, dados } = await salvarOverride('content:identity', { mood, icon: { symbol }, illustration });
    setSalvando(false);
    if (!ok) { setErro(dados.error || 'erro ao salvar'); return; }
    recarregar();
  }

  async function voltarAoPadrao() {
    setErro(''); setSalvando(true);
    const { ok, dados } = await removerOverride('content:identity');
    setSalvando(false);
    if (!ok) { setErro(dados.error || 'erro ao voltar ao padrão'); return; }
    recarregar();
  }

  return (
    <Card className="space-y-4">
      <h2 className="display text-lg font-semibold" style={{ color: 'var(--cor-texto)' }}>Identidade</h2>

      <div className="space-y-1">
        <label className="block text-sm" style={{ color: 'var(--cor-texto-suave)' }}>Clima</label>
        <select
          value={mood}
          onChange={e => setMood(e.target.value)}
          className="w-full rounded-xl border p-3"
          style={{ borderColor: 'var(--cor-linha)', color: 'var(--cor-texto)' }}
        >
          {MOODS.map(m => (
            <option key={m} value={m}>{ROTULOS_CLIMA[m] || m}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm" style={{ color: 'var(--cor-texto-suave)' }}>Símbolo</label>
        <div className="flex flex-wrap gap-2">
          {SYMBOLS.map(nome => {
            const s = SIMBOLOS[nome];
            const ativo = symbol === nome;
            return (
              <button
                key={nome}
                type="button"
                onClick={() => setSymbol(nome)}
                aria-pressed={ativo}
                title={nome}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1.5px solid ${ativo ? 'var(--cor-primaria)' : 'var(--cor-linha)'}`,
                  background: ativo ? 'var(--cor-primaria)' : '#fff',
                }}
              >
                <svg
                  width={22}
                  height={22}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={ativo ? '#fff' : 'var(--cor-texto)'}
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dangerouslySetInnerHTML={{ __html: s.paths }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm" style={{ color: 'var(--cor-texto-suave)' }}>Ilustração</label>
        <select
          value={illustration}
          onChange={e => setIllustration(e.target.value)}
          className="w-full rounded-xl border p-3"
          style={{ borderColor: 'var(--cor-linha)', color: 'var(--cor-texto)' }}
        >
          {ILLUSTRATIONS.map(i => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      {erro && <p className="text-sm" style={{ color: '#C0392B' }}>{erro}</p>}
      <div className="flex gap-2">
        <Button onClick={salvar} disabled={salvando}>Salvar identidade</Button>
        {override && (
          <button
            onClick={voltarAoPadrao}
            disabled={salvando}
            className="rounded-xl border px-3 py-3 font-semibold disabled:opacity-50"
            style={{ borderColor: 'var(--cor-linha)', color: 'var(--cor-texto)' }}
          >
            Voltar ao padrão
          </button>
        )}
      </div>
    </Card>
  );
}

function AppForm({ config, overrides, recarregar }) {
  const atual = { ...config.app, ...(overrides['content:app'] || {}) };
  const [valores, setValores] = useState(atual);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro(''); setSalvando(true);
    const r = await fetch('/api/painel/conteudo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'content:app', value: valores }),
    });
    const dados = await r.json();
    setSalvando(false);
    if (!r.ok) { setErro(dados.error || 'erro ao salvar'); return; }
    recarregar();
  }

  return (
    <Card className="space-y-3">
      <h2 className="display text-lg font-semibold" style={{ color: 'var(--cor-texto)' }}>Textos do app</h2>
      <div className="space-y-2">
        <label className="block text-sm" style={{ color: 'var(--cor-texto-suave)' }}>Nome
          <Input value={valores.name} onChange={e => setValores(v => ({ ...v, name: e.target.value }))} />
        </label>
        <label className="block text-sm" style={{ color: 'var(--cor-texto-suave)' }}>Nome curto
          <Input value={valores.shortName} onChange={e => setValores(v => ({ ...v, shortName: e.target.value }))} />
        </label>
        <label className="block text-sm" style={{ color: 'var(--cor-texto-suave)' }}>Slogan
          <Input value={valores.slogan} onChange={e => setValores(v => ({ ...v, slogan: e.target.value }))} />
        </label>
        <label className="block text-sm" style={{ color: 'var(--cor-texto-suave)' }}>Descrição
          <Input value={valores.description} onChange={e => setValores(v => ({ ...v, description: e.target.value }))} />
        </label>
      </div>
      {erro && <p className="text-sm" style={{ color: '#C0392B' }}>{erro}</p>}
      <Button onClick={salvar} disabled={salvando}>Salvar</Button>
    </Card>
  );
}

function ModuloBloco({ mod, override, recarregar }) {
  const [title, setTitle] = useState(override?.title ?? mod.title);
  const [subtitle, setSubtitle] = useState(override?.subtitle ?? mod.subtitle);
  const [contentTexto, setContentTexto] = useState(JSON.stringify(override?.content ?? mod.content, null, 2));
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro('');
    let content;
    try {
      content = JSON.parse(contentTexto);
    } catch {
      setErro('JSON inválido');
      return;
    }
    setSalvando(true);
    const r = await fetch('/api/painel/conteudo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: `content:module:${mod.key}`, value: { title, subtitle, content } }),
    });
    const dados = await r.json();
    setSalvando(false);
    if (!r.ok) { setErro(dados.error || 'erro ao salvar'); return; }
    recarregar();
  }

  async function voltarAoPadrao() {
    setErro(''); setSalvando(true);
    const r = await fetch('/api/painel/conteudo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: `content:module:${mod.key}` }),
    });
    setSalvando(false);
    if (!r.ok) { const dados = await r.json(); setErro(dados.error || 'erro ao voltar ao padrão'); return; }
    recarregar();
  }

  return (
    <Card className="space-y-3">
      <h2 className="display text-lg font-semibold" style={{ color: 'var(--cor-texto)' }}>{mod.title} <span className="text-sm font-normal" style={{ color: 'var(--cor-texto-suave)' }}>({mod.key})</span></h2>
      <div className="space-y-2">
        <label className="block text-sm" style={{ color: 'var(--cor-texto-suave)' }}>Título
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </label>
        <label className="block text-sm" style={{ color: 'var(--cor-texto-suave)' }}>Subtítulo
          <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} />
        </label>
        <label className="block text-sm" style={{ color: 'var(--cor-texto-suave)' }}>Conteúdo (JSON)
          <textarea
            className="h-64 w-full rounded-xl border p-3 font-mono text-xs"
            value={contentTexto}
            onChange={e => setContentTexto(e.target.value)}
          />
        </label>
      </div>
      {erro && <p className="text-sm" style={{ color: '#C0392B' }}>{erro}</p>}
      <div className="flex gap-2">
        <Button onClick={salvar} disabled={salvando}>Validar e salvar</Button>
        {override && (
          <button
            onClick={voltarAoPadrao}
            disabled={salvando}
            className="rounded-xl border px-3 py-3 font-semibold disabled:opacity-50"
          >
            Voltar ao padrão
          </button>
        )}
      </div>
    </Card>
  );
}

export default function EditorConteudo() {
  const [dados, setDados] = useState(null);

  async function carregar() {
    const r = await fetch('/api/painel/conteudo');
    setDados(await r.json());
  }

  useEffect(() => { carregar(); }, []);

  if (!dados) return <p>Carregando...</p>;

  const { config, overrides } = dados;

  return (
    <div className="space-y-6">
      <AparenciaForm config={config} overrides={overrides} recarregar={carregar} />
      <IdentidadeForm config={config} overrides={overrides} recarregar={carregar} />
      <p className="text-xs" style={{ color: 'var(--cor-texto-suave)' }}>
        Mudar o símbolo aqui atualiza a identidade dentro do app na hora. O ícone instalado no
        celular (o que aparece na tela inicial) só muda depois de rodar <code>npm run icones</code>
        e publicar de novo.
      </p>
      <AppForm config={config} overrides={overrides} recarregar={carregar} />
      {config.modules.map(mod => (
        <ModuloBloco
          key={mod.key}
          mod={mod}
          override={overrides[`content:module:${mod.key}`]}
          recarregar={carregar}
        />
      ))}
    </div>
  );
}
