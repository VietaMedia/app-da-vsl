import { test, expect } from 'vitest';
import { renderMarkdown } from '@/components/ui/Markdown';
test('negrito, título e lista', () => {
  const h = renderMarkdown('## Título\n\nTexto **forte**\n\n- um\n- dois');
  expect(h).toContain('<h2>Título</h2>'); expect(h).toContain('<strong>forte</strong>'); expect(h).toContain('<li>dois</li>');
});
test('escapa html malicioso', () => { expect(renderMarkdown('<script>x</script>')).not.toContain('<script>'); });
