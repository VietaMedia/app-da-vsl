import { test, expect } from 'vitest';
import { embedUrl } from '@/lib/modulos/video';

test('youtube watch?v= vira embed', () => {
  expect(embedUrl('https://www.youtube.com/watch?v=abc123')).toBe('https://www.youtube.com/embed/abc123');
});
test('youtu.be vira o mesmo embed', () => {
  expect(embedUrl('https://youtu.be/abc123')).toBe('https://www.youtube.com/embed/abc123');
});
test('vimeo vira player embed', () => {
  expect(embedUrl('https://vimeo.com/12345')).toBe('https://player.vimeo.com/video/12345');
});
test('provedor desconhecido retorna null', () => {
  expect(embedUrl('https://example.com/x.mp4')).toBeNull();
});
test('esquema não-http retorna null', () => {
  expect(embedUrl('javascript:alert(1)')).toBeNull();
});
test('youtube shorts vira embed', () => {
  expect(embedUrl('https://www.youtube.com/shorts/abc123')).toBe('https://www.youtube.com/embed/abc123');
});
test('youtube watch com v depois de outro parâmetro vira embed', () => {
  expect(embedUrl('https://www.youtube.com/watch?list=PL1&v=abc123')).toBe('https://www.youtube.com/embed/abc123');
});
