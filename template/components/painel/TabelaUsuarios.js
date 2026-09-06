'use client';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Botao from '@/components/ui/Botao';

export default function TabelaUsuarios({ donoId }) {
  const [usuarios, setUsuarios] = useState(null);
  const [carregandoId, setCarregandoId] = useState(null);
  const [erro, setErro] = useState('');

  async function carregar() {
    const r = await fetch('/api/painel/usuarios');
    const dados = await r.json();
    setUsuarios(Array.isArray(dados) ? dados : []);
  }

  useEffect(() => { carregar(); }, []);

  async function alternarStatus(u) {
    setErro('');
    setCarregandoId(u.id);
    const novoStatus = u.status === 'ativo' ? 'bloqueado' : 'ativo';
    const r = await fetch(`/api/painel/usuarios/${u.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    });
    const dados = await r.json();
    if (!r.ok) { setErro(dados.error || 'erro ao atualizar'); setCarregandoId(null); return; }
    setUsuarios(prev => prev.map(x => (x.id === u.id ? { ...x, status: dados.status } : x)));
    setCarregandoId(null);
  }

  if (!usuarios) return <p style={{ color: 'var(--cor-texto-suave)' }}>Carregando...</p>;

  return (
    <Card className="overflow-x-auto">
      {erro && <p className="mb-2 text-sm" style={{ color: '#C0392B' }}>{erro}</p>}
      <table className="tabela-responsiva w-full text-left text-sm" style={{ color: 'var(--cor-texto)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--cor-linha)' }}>
            <th className="py-2 pr-2">E-mail</th>
            <th className="py-2 pr-2">Cadastro</th>
            <th className="py-2 pr-2">Status</th>
            <th className="py-2 pr-2"></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid var(--cor-linha)' }}>
              <td className="py-2 pr-2" data-rotulo="E-mail">{u.email}</td>
              <td className="py-2 pr-2" data-rotulo="Cadastro">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
              <td className="py-2 pr-2" data-rotulo="Status">{u.status}</td>
              <td className="py-2 pr-2" data-rotulo="">
                {u.id === donoId ? (
                  <span style={{ color: 'var(--cor-texto-suave)' }}>você</span>
                ) : (
                  <Botao
                    variante="secundario"
                    pequeno
                    onClick={() => alternarStatus(u)}
                    carregando={carregandoId === u.id}
                    style={{ width: 'auto', padding: '0 16px' }}
                  >
                    {u.status === 'ativo' ? 'Bloquear' : 'Desbloquear'}
                  </Botao>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
