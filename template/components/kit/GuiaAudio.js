'use client';
import { useRef, useState } from 'react';
import Icone from '@/components/ui/Icone';
import { formatarMMSS } from '@/lib/cronometro-puro';
import { t } from '@/lib/i18n';

// Guia tipo "audio": um único elemento <audio> controlado, lista de faixas
// (título + duração), faixa atual destacada, play/pause 56px, barra de
// progresso arrastável (44px de altura de toque), tempo mm:ss e avanço
// automático pra próxima faixa ao terminar.
export default function GuiaAudio({ guide, locale = 'pt' }) {
  const audioRef = useRef(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [atualMs, setAtualMs] = useState(0);
  const [duracaoMs, setDuracaoMs] = useState(0);
  const [erro, setErro] = useState('');

  const faixa = guide.tracks[indiceAtual];

  // Troca de faixa: seta o <audio ref> imperativamente (src + load) e devolve
  // a Promise de play() pra quem chamou decidir como tratar o erro. Setar o
  // src direto no elemento (em vez de esperar o próximo render) é o que
  // permite chamar .play() de forma síncrona dentro do handler de clique —
  // no iOS Safari, um play() adiado (setTimeout/microtask) perde a "user
  // activation" do toque e é bloqueado.
  function iniciarFaixa(i) {
    const audio = audioRef.current;
    setIndiceAtual(i);
    setAtualMs(0);
    setDuracaoMs(0);
    setErro('');
    if (!audio) return Promise.resolve();
    audio.src = guide.tracks[i].url;
    audio.load();
    return audio.play();
  }

  function alternar() {
    const audio = audioRef.current;
    if (!audio) return;
    if (tocando) audio.pause();
    else audio.play().catch(() => setErro(t(locale, 'kit.erroReproduzir')));
  }

  function aoCarregarMetadados() {
    setDuracaoMs((audioRef.current?.duration || 0) * 1000);
  }

  function aoAtualizarTempo() {
    setAtualMs((audioRef.current?.currentTime || 0) * 1000);
  }

  function aoTerminar() {
    if (indiceAtual < guide.tracks.length - 1) {
      // Chamado de dentro do handler nativo `ended`: o WebKit permite dar
      // continuidade à reprodução aqui sem precisar de um novo toque do
      // usuário — por isso play() é chamado de forma síncrona, sem setTimeout.
      iniciarFaixa(indiceAtual + 1).catch(() => setErro(t(locale, 'kit.erroReproduzir')));
    } else {
      setTocando(false);
    }
  }

  function aoDarErro() {
    setErro(t(locale, 'kit.erroCarregar'));
    setTocando(false);
  }

  function buscar(e) {
    const audio = audioRef.current;
    const novoMs = Number(e.target.value);
    if (audio) audio.currentTime = novoMs / 1000;
    setAtualMs(novoMs);
  }

  async function selecionarFaixa(i) {
    if (i === indiceAtual) { alternar(); return; }
    // Síncrono até o play(): o toque do usuário no botão da faixa precisa
    // chegar direto no play() pra contar como "user activation" no iOS Safari.
    try {
      await iniciarFaixa(i);
    } catch {
      setErro(t(locale, 'kit.erroReproduzir'));
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={faixa.url}
        preload="metadata"
        onLoadedMetadata={aoCarregarMetadados}
        onTimeUpdate={aoAtualizarTempo}
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
        onEnded={aoTerminar}
        onError={aoDarErro}
      />

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={alternar}
            aria-label={tocando ? t(locale, 'kit.pausarAria') : t(locale, 'kit.tocar')}
            style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0, border: 'none', cursor: 'pointer',
              background: 'var(--cor-primaria)', color: '#fff', boxShadow: 'var(--sombra-primaria)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icone nome={tocando ? 'pause' : 'play'} tamanho={26} cor="#fff" traco={2} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {faixa.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--cor-texto-suave)' }}>
              {formatarMMSS(atualMs)} / {formatarMMSS(duracaoMs)}
            </div>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={Math.max(duracaoMs, 1)}
          value={Math.min(atualMs, duracaoMs || 0)}
          onChange={buscar}
          disabled={!duracaoMs}
          aria-label={t(locale, 'kit.progressoAudioAria')}
          style={{ width: '100%', height: 44, accentColor: 'var(--cor-primaria)', cursor: duracaoMs ? 'pointer' : 'default' }}
        />

        {erro && <p style={{ color: '#B3261E', fontSize: 13 }}>{erro}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {guide.tracks.map((track, i) => {
          const atual = i === indiceAtual;
          return (
            <button
              key={i}
              type="button"
              onClick={() => selecionarFaixa(i)}
              className="card"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                textAlign: 'left', cursor: 'pointer', minHeight: 44,
                border: atual ? '1.5px solid var(--cor-primaria)' : '1px solid var(--cor-linha)',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: atual ? 800 : 700, color: atual ? 'var(--cor-primaria)' : 'var(--cor-texto)' }}>
                {track.title}
              </span>
              {track.duration && <span style={{ fontSize: 13, color: 'var(--cor-texto-suave)', flexShrink: 0 }}>{track.duration}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
