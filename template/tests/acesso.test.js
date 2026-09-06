import { test, expect } from 'vitest';
import { decidirLiberacao, podeEntrar, exigePin, pinConfere } from '@/lib/acesso';

test('usuário existente + ativo → atualizar', () => {
  expect(decidirLiberacao({ id: 1 }, 'ativo')).toBe('atualizar');
});

test('usuário existente + bloqueado → atualizar', () => {
  expect(decidirLiberacao({ id: 1 }, 'bloqueado')).toBe('atualizar');
});

test('usuário inexistente + ativo → criar', () => {
  expect(decidirLiberacao(null, 'ativo')).toBe('criar');
});

test('usuário inexistente + bloqueado → ignorar', () => {
  expect(decidirLiberacao(null, 'bloqueado')).toBe('ignorar');
});

test('status inválido → invalido', () => {
  expect(decidirLiberacao(null, 'lixo')).toBe('invalido');
  expect(decidirLiberacao({ id: 1 }, 'lixo')).toBe('invalido');
});

test('usuário existente é o dono → protegido', () => {
  expect(decidirLiberacao({ id: 1, role: 'owner' }, 'bloqueado', true)).toBe('protegido');
});

test('usuário inexistente mas é o e-mail do dono → protegido', () => {
  expect(decidirLiberacao(null, 'ativo', true)).toBe('protegido');
});

test('podeEntrar: usuário existente sempre entra, portão aberto ou fechado', () => {
  expect(podeEntrar({ existente: { id: 1 }, acessoFechado: false })).toBe('entrar');
  expect(podeEntrar({ existente: { id: 1 }, acessoFechado: true })).toBe('entrar');
});

test('podeEntrar: usuário inexistente + portão aberto → criar', () => {
  expect(podeEntrar({ existente: null, acessoFechado: false })).toBe('criar');
});

test('podeEntrar: usuário inexistente + portão fechado → recusar', () => {
  expect(podeEntrar({ existente: null, acessoFechado: true })).toBe('recusar');
});

test('exigePin: sem OWNER_PIN configurado, nunca exige', () => {
  expect(exigePin({ email: 'dono@x.com', ownerEmail: 'dono@x.com', ownerPin: undefined })).toBe(false);
});

test('exigePin: e-mail do dono com OWNER_PIN configurado → exige', () => {
  expect(exigePin({ email: 'dono@x.com', ownerEmail: 'dono@x.com', ownerPin: '123456' })).toBe(true);
});

test('exigePin: e-mail de comprador comum → não exige, mesmo com OWNER_PIN configurado', () => {
  expect(exigePin({ email: 'aluno@x.com', ownerEmail: 'dono@x.com', ownerPin: '123456' })).toBe(false);
});

test('exigePin: sem OWNER_EMAIL configurado, nunca exige', () => {
  expect(exigePin({ email: 'dono@x.com', ownerEmail: '', ownerPin: '123456' })).toBe(false);
});

test('pinConfere: PIN certo confere', () => {
  expect(pinConfere('123456', '123456')).toBe(true);
});

test('pinConfere: PIN errado não confere', () => {
  expect(pinConfere('654321', '123456')).toBe(false);
});

test('pinConfere: tamanhos diferentes não confere (sem lançar)', () => {
  expect(pinConfere('1', '123456')).toBe(false);
  expect(pinConfere('', '123456')).toBe(false);
  expect(pinConfere(undefined, '123456')).toBe(false);
});
