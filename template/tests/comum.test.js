import { test, expect, vi } from 'vitest';
import { toggleCheckin, toggleProgress, validarProgresso } from '@/lib/modulos/comum';

const chave = { userId: 1, moduleKey: 'protocolo-21-dias', itemKey: 'd1-t0', date: '2026-09-05' };

test('cria check-in quando ainda não existe', async () => {
  const create = vi.fn().mockResolvedValue({});
  const deleteMany = vi.fn();
  const prisma = { checkin: { create, deleteMany } };
  const r = await toggleCheckin(prisma, chave);
  expect(r).toEqual({ ativo: true });
  expect(create).toHaveBeenCalledWith({ data: chave });
  expect(deleteMany).not.toHaveBeenCalled();
});

test('remove check-in quando create colide (P2002) — já existia', async () => {
  const create = vi.fn().mockRejectedValue({ code: 'P2002' });
  const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
  const prisma = { checkin: { create, deleteMany } };
  const r = await toggleCheckin(prisma, chave);
  expect(r).toEqual({ ativo: false });
  expect(deleteMany).toHaveBeenCalledWith({ where: chave });
});

test('propaga erros que não são de colisão única', async () => {
  const create = vi.fn().mockRejectedValue(new Error('conexão caiu'));
  const deleteMany = vi.fn();
  const prisma = { checkin: { create, deleteMany } };
  await expect(toggleCheckin(prisma, chave)).rejects.toThrow('conexão caiu');
  expect(deleteMany).not.toHaveBeenCalled();
});

const chaveProgresso = { userId: 1, moduleKey: 'metodo', stepKey: 'por-que', itemIndex: -1 };

test('progresso: cria quando ainda não existe', async () => {
  const create = vi.fn().mockResolvedValue({});
  const deleteMany = vi.fn();
  const prisma = { progress: { create, deleteMany } };
  const r = await toggleProgress(prisma, chaveProgresso);
  expect(r).toEqual({ ativo: true });
  expect(create).toHaveBeenCalledWith({ data: chaveProgresso });
  expect(deleteMany).not.toHaveBeenCalled();
});

test('progresso: remove quando create colide (P2002)', async () => {
  const create = vi.fn().mockRejectedValue({ code: 'P2002' });
  const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
  const prisma = { progress: { create, deleteMany } };
  const r = await toggleProgress(prisma, chaveProgresso);
  expect(r).toEqual({ ativo: false });
  expect(deleteMany).toHaveBeenCalledWith({ where: chaveProgresso });
});

test('progresso: propaga erros que não são de colisão única', async () => {
  const create = vi.fn().mockRejectedValue(new Error('conexão caiu'));
  const deleteMany = vi.fn();
  const prisma = { progress: { create, deleteMany } };
  await expect(toggleProgress(prisma, chaveProgresso)).rejects.toThrow('conexão caiu');
  expect(deleteMany).not.toHaveBeenCalled();
});

const modTrilha = { content: { sections: [{ key: 's1', title: 'S1', steps: [{ key: 'por-que', title: 'P', body: '', checklist: ['a', 'b'] }] }] } };

test('validarProgresso: passo inexistente é rejeitado', () => {
  expect(validarProgresso(modTrilha, 'nao-existe', -1)).toEqual({ ok: false, erro: 'passo não encontrado' });
});
test('validarProgresso: itemIndex -1 (passo inteiro) é aceito', () => {
  expect(validarProgresso(modTrilha, 'por-que', -1)).toEqual({ ok: true });
});
test('validarProgresso: itemIndex dentro do checklist é aceito', () => {
  expect(validarProgresso(modTrilha, 'por-que', 1)).toEqual({ ok: true });
});
test('validarProgresso: itemIndex fora do checklist é rejeitado', () => {
  expect(validarProgresso(modTrilha, 'por-que', 2).ok).toBe(false);
});
test('validarProgresso: itemIndex não inteiro (string, float, NaN) é rejeitado', () => {
  expect(validarProgresso(modTrilha, 'por-que', '1').ok).toBe(false);
  expect(validarProgresso(modTrilha, 'por-que', 1.5).ok).toBe(false);
  expect(validarProgresso(modTrilha, 'por-que', NaN).ok).toBe(false);
  expect(validarProgresso(modTrilha, 'por-que', undefined).ok).toBe(false);
});
